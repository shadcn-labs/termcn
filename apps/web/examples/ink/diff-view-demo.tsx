import { DiffView } from "@/registry/bases/ink/ui/diff-view";

export default function DiffViewDemo() {
  return (
    <DiffView
      filename="config.ts"
      showLineNumbers
      oldText={"const port = 3000;\nconst host = 'localhost';"}
      newText={
        "const port = 8080;\nconst host = 'localhost';\nconst debug = true;"
      }
    />
  );
}
