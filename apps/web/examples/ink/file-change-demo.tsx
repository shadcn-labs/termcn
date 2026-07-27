import { FileChange } from "@/registry/bases/ink/ui/file-change";

export default function FileChangeDemo() {
  return (
    <FileChange
      changes={[
        { diff: "-old line\n+new line", path: "src/utils.ts", type: "modify" },
        {
          content: "export const add = (a, b) => a + b;",
          path: "src/helpers.ts",
          type: "create",
        },
        { path: "src/legacy.ts", type: "delete" },
      ]}
    />
  );
}
