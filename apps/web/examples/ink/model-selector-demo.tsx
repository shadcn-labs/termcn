import { ModelSelector } from "@/registry/bases/ink/ui/model-selector";

export default function ModelSelectorDemo() {
  return (
    <ModelSelector
      models={[
        { context: 128_000, id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
        {
          context: 200_000,
          id: "claude-3-5-sonnet",
          name: "Claude 3.5 Sonnet",
          provider: "Anthropic",
        },
      ]}
      selected="gpt-4o"
    />
  );
}
