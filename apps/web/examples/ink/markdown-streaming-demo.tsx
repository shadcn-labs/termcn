import { Markdown } from "@/registry/bases/ink/ui/markdown";

export default function MarkdownStreamingDemo() {
  return (
    <Markdown streaming cursor="▌">
      {"## Streaming\n\n```ts\nconst answer = "}
    </Markdown>
  );
}
