import { Tree } from "@/registry/bases/ink/ui/tree";

export default function TreeDemo() {
  return (
    <Tree
      defaultExpanded={["src"]}
      nodes={[
        {
          children: [
            { key: "index", label: "index.ts" },
            { key: "utils", label: "utils.ts" },
          ],
          key: "src",
          label: "src",
        },
        { key: "pkg", label: "package.json" },
        { key: "readme", label: "README.md" },
      ]}
    />
  );
}
