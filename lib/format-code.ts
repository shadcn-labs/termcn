import { transformIcons, transformMenu, transformRender } from "shadcn/utils";
import { Project, ScriptKind } from "ts-morph";
import type { SourceFile } from "ts-morph";

import { BASES } from "@/registry/bases";

const buildDisplayConfig = () => ({
  $schema: "https://ui.shadcn.com/schema.json",
  aliases: {
    components: "@/components",
    hooks: "@/hooks",
    lib: "@/lib",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  iconLibrary: "lucide",
  resolvedPaths: {
    components: "@/components",
    cwd: "/",
    hooks: "@/hooks",
    lib: "@/lib",
    tailwindConfig: "",
    tailwindCss: "",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  rsc: true,
  style: "base-nova",
  tailwind: {
    baseColor: "neutral",
    config: "",
    css: "",
    cssVariables: true,
    prefix: "",
  },
  tsx: true,
});

type DisplayTransformer = (opts: {
  filename: string;
  raw: string;
  sourceFile: SourceFile;
  config: ReturnType<typeof buildDisplayConfig>;
}) => Promise<unknown>;

export const formatCode = async (code: string) => {
  let formattedCode = code;
  for (const base of BASES) {
    formattedCode = formattedCode.replaceAll(
      `@/registry/bases/${base.name}/`,
      "@/components/"
    );
  }

  formattedCode = formattedCode.replaceAll("export default", "export");

  try {
    const config = buildDisplayConfig();
    const project = new Project({ compilerOptions: {} });
    const sourceFile = project.createSourceFile(
      "component.tsx",
      formattedCode,
      {
        scriptKind: ScriptKind.TSX,
      }
    );

    const transformers: DisplayTransformer[] = [
      transformIcons as DisplayTransformer,
      transformMenu as DisplayTransformer,
      transformRender as DisplayTransformer,
    ];

    await Promise.all(
      transformers.map((transformer) =>
        transformer({
          config,
          filename: "component.tsx",
          raw: formattedCode,
          sourceFile,
        })
      )
    );

    return sourceFile.getText().trim();
  } catch (error) {
    console.error("Transform failed:", error);
    return code;
  }
};
