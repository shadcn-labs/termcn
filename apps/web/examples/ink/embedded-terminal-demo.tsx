import { EmbeddedTerminal } from "@/registry/bases/ink/ui/embedded-terminal";

export default function EmbeddedTerminalDemo() {
  return <EmbeddedTerminal command="bash" args={["-c", "echo Hello world"]} />;
}
