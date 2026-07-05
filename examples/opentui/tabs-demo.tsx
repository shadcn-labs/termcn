import { Tabs } from "@/registry/bases/opentui/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs
      defaultTab="general"
      tabs={[
        {
          content: <text>General settings.</text>,
          key: "general",
          label: "General",
        },
        {
          content: <text>Theme configuration.</text>,
          key: "appearance",
          label: "Appearance",
        },
        {
          content: <text>Shortcut mappings.</text>,
          key: "keybindings",
          label: "Keybindings",
        },
      ]}
    />
  );
}
