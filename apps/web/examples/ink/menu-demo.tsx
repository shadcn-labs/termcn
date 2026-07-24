import { Menu } from "@/registry/bases/ink/ui/menu";

export default function MenuDemo() {
  return (
    <Menu
      title="File"
      items={[
        { icon: "📄", key: "new", label: "New File", shortcut: "⌘N" },
        { icon: "📂", key: "open", label: "Open...", shortcut: "⌘O" },
        { key: "sep1", label: "", separator: true },
        { key: "save", label: "Save", shortcut: "⌘S" },
        { disabled: true, key: "export", label: "Export" },
      ]}
    />
  );
}
