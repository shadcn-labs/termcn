import "server-only";

const DEFAULT_REPOSITORY = "shadcn-labs/termcn-pro";
const DEFAULT_REF = "main";
const GITHUB_API_VERSION = "2026-03-10";
const MAX_DIRECTORY_DEPTH = 8;
const MAX_DIRECTORY_FILES = 200;

interface GithubContentEntry {
  path: string;
  type: "dir" | "file" | "submodule" | "symlink";
}

export interface ProSourceFile {
  content: Buffer;
  path: string;
  relativePath: string;
}

export class ProSourceError extends Error {
  readonly status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ProSourceError";
    this.status = status;
  }
}

const getGithubConfiguration = () => {
  const token = process.env.TERMCN_PRO_GITHUB_TOKEN?.trim();
  const repository =
    process.env.TERMCN_PRO_GITHUB_REPOSITORY?.trim() || DEFAULT_REPOSITORY;
  const ref = process.env.TERMCN_PRO_GITHUB_REF?.trim() || DEFAULT_REF;

  if (!token) {
    throw new ProSourceError("TERMCN_PRO_GITHUB_TOKEN is not configured", 503);
  }
  if (!/^[\w.-]+\/[\w.-]+$/u.test(repository)) {
    throw new ProSourceError(
      "TERMCN_PRO_GITHUB_REPOSITORY must use owner/repository format",
      503
    );
  }
  if (!ref || ref.length > 255) {
    throw new ProSourceError("TERMCN_PRO_GITHUB_REF is invalid", 503);
  }
  return { ref, repository, token };
};

const normalizeRepositoryPath = (repositoryPath: string) => {
  const segments = repositoryPath.split("/");
  if (
    repositoryPath.startsWith("/") ||
    repositoryPath.includes("\\") ||
    segments.some(
      (segment) => segment === "" || segment === "." || segment === ".."
    )
  ) {
    throw new ProSourceError("Invalid private repository path");
  }
  return segments.join("/");
};

const githubContentsUrl = (
  repository: string,
  repositoryPath: string,
  ref: string
) => {
  const encodedPath = normalizeRepositoryPath(repositoryPath)
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const url = new URL(
    `https://api.github.com/repos/${repository}/contents/${encodedPath}`
  );
  url.searchParams.set("ref", ref);
  return url;
};

const fetchGithubContent = async (
  repositoryPath: string,
  accept: "json" | "raw"
) => {
  const { ref, repository, token } = getGithubConfiguration();
  const response = await fetch(
    githubContentsUrl(repository, repositoryPath, ref),
    {
      headers: {
        Accept:
          accept === "raw"
            ? "application/vnd.github.raw+json"
            : "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "termcn-pro-delivery",
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    const status = response.status === 404 ? 404 : 502;
    throw new ProSourceError(
      `GitHub returned ${response.status} for private source`,
      status
    );
  }
  return response;
};

export const fetchProFile = async (repositoryPath: string) => {
  const response = await fetchGithubContent(repositoryPath, "raw");
  return Buffer.from(await response.arrayBuffer());
};

export const fetchProText = async (repositoryPath: string) => {
  const content = await fetchProFile(repositoryPath);
  return content.toString("utf-8");
};

const listDirectory = async (
  rootPath: string,
  currentPath: string,
  depth: number
): Promise<ProSourceFile[]> => {
  if (depth > MAX_DIRECTORY_DEPTH) {
    throw new ProSourceError("Private source directory nesting is too deep");
  }

  const response = await fetchGithubContent(currentPath, "json");
  const entries = (await response.json()) as GithubContentEntry[];
  if (!Array.isArray(entries)) {
    throw new ProSourceError("Private source directory response is invalid");
  }

  const children = await Promise.all(
    entries
      .toSorted((left, right) => left.path.localeCompare(right.path))
      .map(async (entry): Promise<ProSourceFile[]> => {
        if (entry.type === "dir") {
          return await listDirectory(rootPath, entry.path, depth + 1);
        }
        if (entry.type !== "file") {
          return [];
        }
        const expectedPrefix = `${rootPath}/`;
        if (!entry.path.startsWith(expectedPrefix)) {
          throw new ProSourceError("Private source escaped its directory root");
        }
        return [
          {
            content: await fetchProFile(entry.path),
            path: entry.path,
            relativePath: entry.path.slice(expectedPrefix.length),
          },
        ];
      })
  );
  return children.flat();
};

export const fetchProDirectory = async (
  repositoryPath: string
): Promise<ProSourceFile[]> => {
  const rootPath = normalizeRepositoryPath(repositoryPath);
  const files = await listDirectory(rootPath, rootPath, 0);
  if (files.length > MAX_DIRECTORY_FILES) {
    throw new ProSourceError(
      `Private source directory exceeds ${MAX_DIRECTORY_FILES} files`
    );
  }
  return files;
};
