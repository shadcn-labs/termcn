import { AppShell } from "@/registry/bases/opentui/ui/app-shell";

export default function AppShellDemo() {
  return (
    <AppShell>
      <AppShell.Header>
        <AppShell.Tip>Press Tab to autocomplete commands</AppShell.Tip>
      </AppShell.Header>
      <AppShell.Input placeholder="Enter a command..." prefix="$" />
      <AppShell.Content height={8}>
        <text>Welcome to the interactive shell.</text>
        <text>Type a command to get started.</text>
        <text fg="#666">Last login: Mon Apr 5 09:22:13</text>
      </AppShell.Content>
      <AppShell.Hints items={["↑↓ scroll", "enter submit", "esc quit"]} />
    </AppShell>
  );
}
