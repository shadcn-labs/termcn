import { TabbedContent } from "@/registry/bases/opentui/ui/tabbed-content";

export default function TabbedContentDemo() {
  return (
    <TabbedContent
      defaultTab="overview"
      tabBarStyle="underline"
      tabs={[
        {
          content: <text>Project overview goes here.</text>,
          id: "overview",
          label: "Overview",
        },
        {
          content: <text>Application logs output.</text>,
          id: "logs",
          label: "Logs",
        },
        {
          content: <text>Configuration panel.</text>,
          id: "settings",
          label: "Settings",
        },
      ]}
    />
  );
}
