import { Text } from "ink";

import { AppShell } from "@/registry/bases/ink/ui/app-shell";

export default function AppShellDemo() {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Tip>Press Tab to autocomplete commands</AppShell.Tip>
      </AppShell.Header>
      <AppShell.Input placeholder="Enter a command..." prefix="$" />
      <AppShell.Content height={8}>
        <Text>Welcome to the interactive shell.</Text>
        <Text>Type a command to get started.</Text>
        <Text dimColor>Last login: Mon Apr 5 09:22:13</Text>
      </AppShell.Content>
      <AppShell.Hints items={["↑↓ scroll", "enter submit", "esc quit"]} />
    </AppShell>
  );
}
