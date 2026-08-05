import { Text } from "ink";
import { useState } from "react";

import { AppShell } from "@/registry/bases/ink/ui/app-shell";

export default function AppShellDemo() {
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Tip>
          Press Tab to move between the command input and output
        </AppShell.Tip>
      </AppShell.Header>
      <AppShell.Input
        autoFocus
        placeholder="Enter a command..."
        prefix="$"
        onSubmit={(command) => {
          if (command.trim()) {
            setLastCommand(command);
          }
        }}
      />
      <AppShell.Content height={8}>
        <Text>Welcome to the interactive shell.</Text>
        <Text>Type a command to get started.</Text>
        {lastCommand && <Text>Submitted: {lastCommand}</Text>}
        <Text dimColor>Last login: Mon Apr 5 09:22:13</Text>
      </AppShell.Content>
      <AppShell.Hints items={["tab focus", "enter submit", "↑↓ scroll"]} />
    </AppShell>
  );
}
