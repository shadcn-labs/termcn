import { Definition } from "@/registry/bases/opentui/ui/definition";

export default function DefinitionDemo() {
  return (
    <Definition
      items={[
        { description: "Command Line Interface", term: "CLI" },
        { description: "Terminal User Interface", term: "TUI" },
        { description: "Read-Eval-Print Loop", term: "REPL" },
      ]}
    />
  );
}
