import { ToolCall } from "@/registry/bases/ink/ui/tool-call";

export default function ToolCallDemo() {
  return (
    <ToolCall
      name="search_codebase"
      args={{ maxResults: 10, query: "handleSubmit" }}
      status="success"
      result="Found 3 matches in src/components/"
      duration={245}
    />
  );
}
