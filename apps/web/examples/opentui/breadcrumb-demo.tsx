import { Breadcrumb } from "@/registry/bases/opentui/ui/breadcrumb";

export default function BreadcrumbDemo() {
  return (
    <Breadcrumb
      items={[
        { key: "home", label: "Home" },
        { key: "registry", label: "Registry" },
        { key: "badge", label: "Badge" },
      ]}
      activeKey="badge"
      separator="›"
    />
  );
}
