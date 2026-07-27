import { KeyboardShortcuts } from "@/registry/bases/ink/ui/keyboard-shortcuts";

export default function KeyboardShortcutsDemo() {
  return (
    <KeyboardShortcuts
      title="Editor Shortcuts"
      shortcuts={[
        { description: "Save file", key: "Ctrl+S" },
        { description: "Undo", key: "Ctrl+Z" },
        { description: "Find", key: "Ctrl+F" },
        { description: "Quick open", key: "Ctrl+P" },
        { description: "Delete line", key: "Ctrl+Shift+K" },
      ]}
    />
  );
}
