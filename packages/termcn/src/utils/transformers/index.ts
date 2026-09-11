import { Project, ScriptKind, type SourceFile } from "ts-morph";

import { Config } from "@/src/utils/get-config";
import { transformImport } from "@/src/utils/transformers/transform-import";

export type TransformOpts = {
  filename: string;
  raw: string;
  config: Config;
};

export type Transformer<Output = SourceFile> = (
  opts: TransformOpts & {
    sourceFile: SourceFile;
  }
) => Promise<Output>;

const project = new Project({
  compilerOptions: {},
  useInMemoryFileSystem: true,
});

let sourceFileCounter = 0;

export async function transform(
  opts: TransformOpts,
  transformers: Transformer[] = [transformImport]
) {
  // ts-morph requires unique paths per source file; the in-memory FS keeps
  // this off disk, so no temp directory is created (or leaked) per file.
  const sourceFile = project.createSourceFile(
    `/${sourceFileCounter++}/${opts.filename}`,
    opts.raw,
    { scriptKind: ScriptKind.TSX }
  );

  try {
    for (const transformer of transformers) {
      await transformer({ sourceFile, ...opts });
    }

    return sourceFile.getText();
  } finally {
    project.removeSourceFile(sourceFile);
  }
}
