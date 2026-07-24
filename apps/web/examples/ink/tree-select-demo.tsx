import { TreeSelect } from "@/registry/bases/ink/ui/tree-select";

export default function TreeSelectDemo() {
  return (
    <TreeSelect
      label="Select a file"
      nodes={[
        {
          children: [
            { label: "index.ts", value: "index.ts" },
            { label: "utils.ts", value: "utils.ts" },
          ],
          label: "src",
          value: "src",
        },
        { label: "README.md", value: "README.md" },
      ]}
    />
  );
}
