import { Breadcrumb } from "@/registry/bases/ink/ui/breadcrumb";

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
