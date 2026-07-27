import { CommandPalette } from "@/registry/bases/ink/ui/command-palette";

export default function CommandPaletteDemo() {
  return (
    <CommandPalette
      isOpen={true}
      placeholder="Type a command..."
      commands={[
        {
          group: "File",
          id: "new-file",
          label: "New File",
          shortcut: "⌘N",
        },
        {
          group: "File",
          id: "open-file",
          label: "Open File",
          shortcut: "⌘O",
        },
        {
          group: "View",
          id: "toggle-theme",
          label: "Toggle Theme",
        },
        {
          group: "Tasks",
          id: "run-build",
          label: "Run Build",
          shortcut: "⌘B",
        },
      ]}
    />
  );
}
