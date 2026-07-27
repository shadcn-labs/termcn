import { Sidebar } from "@/registry/bases/ink/ui/sidebar";

export default function SidebarDemo() {
  return (
    <Sidebar
      title="Explorer"
      activeKey="inbox"
      width={24}
      items={[
        { badge: 3, icon: "📥", key: "inbox", label: "Inbox" },
        { icon: "📝", key: "drafts", label: "Drafts" },
        {
          children: [
            { key: "proj-a", label: "Alpha" },
            { key: "proj-b", label: "Beta" },
          ],
          icon: "📁",
          key: "projects",
          label: "Projects",
        },
        { icon: "⚙", key: "settings", label: "Settings" },
      ]}
    />
  );
}
