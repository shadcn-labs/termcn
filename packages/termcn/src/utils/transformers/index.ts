import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";

import { Project, ScriptKind, type SourceFile } from "ts-morph";

import { Config } from "@/src/utils/get-config";
import { transformImport } from "@/src/utils/transformers/transform-import";
import { transformJsx } from "@/src/utils/transformers/transform-jsx";

export type TransformOpts = {
  filename: string;
  raw: string;
  config: Config;
  transformJsx?: boolean;
};

export type Transformer<Output = SourceFile> = (
  opts: TransformOpts & {
    sourceFile: SourceFile;
  }
) => Promise<Output>;

const project = new Project({
  compilerOptions: {},
});

async function createTempSourceFile(filename: string) {
  const dir = await fs.mkdtemp(path.join(tmpdir(), "termcn-"));
  return path.join(dir, filename);
}

export async function transform(
  opts: TransformOpts,
  transformers: Transformer[] = [transformImport]
) {
  const tempFile = await createTempSourceFile(opts.filename);
  const sourceFile = project.createSourceFile(tempFile, opts.raw, {
    scriptKind: ScriptKind.TSX,
  });

  for (const transformer of transformers) {
    await transformer({ sourceFile, ...opts });
  }

  if (opts.transformJsx) {
    return await transformJsx({
      sourceFile,
      ...opts,
    });
  }

  return sourceFile.getText();
}
