import { Text } from "ink";

import { Tabs } from "@/registry/bases/ink/ui/tabs";

export default function TabsDemo() {
  return (
    <Tabs
      defaultTab="general"
      tabs={[
        {
          content: <Text>General settings.</Text>,
          key: "general",
          label: "General",
        },
        {
          content: <Text>Theme configuration.</Text>,
          key: "appearance",
          label: "Appearance",
        },
        {
          content: <Text>Shortcut mappings.</Text>,
          key: "keybindings",
          label: "Keybindings",
        },
      ]}
    />
  );
}
