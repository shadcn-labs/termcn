import { createHash } from "node:crypto";
import path from "node:path";

import { api } from "@termcn/backend/convex/_generated/api";

import { fetchAuthAction } from "@/lib/auth-server";
import { fetchProDirectory } from "@/lib/pro-github";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TAR_BLOCK_SIZE = 512;
const SKILL_ROOT = "skills/termcn";

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("authorization");
  const [scheme, ...credentials] = authorization?.trim().split(/\s+/u) ?? [];
  return scheme?.toLowerCase() === "bearer" ? credentials.join(" ").trim() : "";
};

const writeOctal = (
  target: Buffer,
  value: number,
  offset: number,
  length: number
) => {
  const octal = value.toString(8).padStart(length - 1, "0");
  target.write(octal.slice(-(length - 1)), offset, length - 1, "ascii");
  target[offset + length - 1] = 0;
};

const createTarHeader = (name: string, size: number) => {
  if (Buffer.byteLength(name) > 100) {
    throw new Error(`Skill archive path is too long: ${name}`);
  }
  const header = Buffer.alloc(TAR_BLOCK_SIZE);
  header.write(name, 0, 100, "utf-8");
  writeOctal(header, 0o644, 100, 8);
  writeOctal(header, 0, 108, 8);
  writeOctal(header, 0, 116, 8);
  writeOctal(header, size, 124, 12);
  writeOctal(header, 0, 136, 12);
  header.fill(0x20, 148, 156);
  header.write("0", 156, 1, "ascii");
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  const checksum = header.reduce((total, byte) => total + byte, 0);
  header.write(
    checksum.toString(8).padStart(6, "0").slice(-6),
    148,
    6,
    "ascii"
  );
  header[154] = 0;
  header[155] = 0x20;
  return header;
};

const createSkillArchive = async () => {
  const files = await fetchProDirectory(SKILL_ROOT);
  if (!files.some((file) => file.relativePath === "SKILL.md")) {
    throw new Error("Private skill bundle is missing SKILL.md");
  }

  const parts = files.flatMap(({ content, relativePath }) => {
    const archivePath = path.posix.join("termcn", relativePath);
    const padding =
      (TAR_BLOCK_SIZE - (content.length % TAR_BLOCK_SIZE)) % TAR_BLOCK_SIZE;
    return [
      createTarHeader(archivePath, content.length),
      content,
      ...(padding > 0 ? [Buffer.alloc(padding)] : []),
    ];
  });

  const skillSource = files
    .find((file) => file.relativePath === "SKILL.md")
    ?.content.toString("utf-8");
  const version =
    skillSource?.match(/^\s*version:\s*["']?([^\s"']+)/mu)?.[1] ?? "latest";

  return {
    archive: Buffer.concat([...parts, Buffer.alloc(TAR_BLOCK_SIZE * 2)]),
    version,
  };
};

const unauthorized = (message: string, status: 401 | 403) =>
  Response.json(
    { error: "skill_access_denied", message },
    {
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": 'Bearer realm="termcn-skill"',
      },
      status,
    }
  );

export const GET = async (request: Request) => {
  const token = getBearerToken(request);
  if (!token) {
    return unauthorized("A short-lived termcn skill token is required.", 401);
  }

  try {
    const valid = await fetchAuthAction(api.licenses.validateSkillToken, {
      token,
    });
    if (!valid) {
      return unauthorized("The termcn skill token is invalid or expired.", 403);
    }

    const { archive, version } = await createSkillArchive();
    const digest = createHash("sha256").update(archive).digest("base64");
    return new Response(new Uint8Array(archive), {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Digest": `sha-256=:${digest}:`,
        "Content-Disposition": `attachment; filename="termcn-skill-v${version}.tar"`,
        "Content-Type": "application/x-tar",
        "X-Termcn-Skill-Version": version,
      },
    });
  } catch (error) {
    console.error("Skill bundle delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      {
        error: "skill_unavailable",
        message: "The termcn skill bundle is temporarily unavailable.",
      },
      { headers: { "Cache-Control": "no-store" }, status: 503 }
    );
  }
};
