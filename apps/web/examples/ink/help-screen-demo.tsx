import { HelpScreen } from "@/registry/bases/ink/ui/help-screen";

export default function HelpScreenDemo() {
  return (
    <HelpScreen
      title="mycli"
      tagline="A blazing-fast task runner"
      usage="mycli <command> [options]"
    >
      <HelpScreen.Section label="Commands">
        <HelpScreen.Row flag="init" description="Create a new project" />
        <HelpScreen.Row flag="build" description="Compile the source files" />
        <HelpScreen.Row flag="test" description="Run the test suite" />
      </HelpScreen.Section>
      <HelpScreen.Section label="Options">
        <HelpScreen.Row
          flag="--help, -h"
          description="Show this help message"
        />
        <HelpScreen.Row
          flag="--version, -v"
          description="Print version number"
        />
        <HelpScreen.Row flag="--verbose" description="Enable verbose logging" />
      </HelpScreen.Section>
    </HelpScreen>
  );
}
