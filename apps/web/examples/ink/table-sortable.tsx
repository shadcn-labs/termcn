import { Table } from "@/registry/bases/ink/ui/table";

const data = [
  { downloads: 1240, name: "badge", status: "stable" },
  { downloads: 980, name: "alert", status: "stable" },
  { downloads: 2100, name: "spinner", status: "beta" },
  { downloads: 1560, name: "table", status: "stable" },
];

export default function TableSortable() {
  return (
    <Table
      columns={[
        { header: "Component", key: "name" },
        { header: "Status", key: "status" },
        { align: "right", header: "Downloads", key: "downloads" },
      ]}
      data={data}
      sortable
    />
  );
}
