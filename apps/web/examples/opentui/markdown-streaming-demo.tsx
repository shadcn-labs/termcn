import { Markdown } from "@/registry/bases/opentui/ui/markdown";

export default function MarkdownStreamingDemo() {
  return (
    <Markdown>{"## Streaming\n\n```ts\nconst answer = 42;\n```"}</Markdown>
  );
}
