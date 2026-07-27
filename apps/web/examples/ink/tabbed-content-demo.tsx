import { Text } from "ink";

import { TabbedContent } from "@/registry/bases/ink/ui/tabbed-content";

export default function TabbedContentDemo() {
  return (
    <TabbedContent
      defaultTab="overview"
      tabBarStyle="underline"
      tabs={[
        {
          content: <Text>Project overview goes here.</Text>,
          id: "overview",
          label: "Overview",
        },
        {
          content: <Text>Application logs output.</Text>,
          id: "logs",
          label: "Logs",
        },
        {
          content: <Text>Configuration panel.</Text>,
          id: "settings",
          label: "Settings",
        },
      ]}
    />
  );
}
