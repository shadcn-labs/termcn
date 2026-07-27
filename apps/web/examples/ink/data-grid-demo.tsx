import { DataGrid } from "@/registry/bases/ink/ui/data-grid";

export default function DataGridDemo() {
  return (
    <DataGrid
      data={[
        { name: "Alice", role: "Engineer", status: "Active" },
        { name: "Bob", role: "Designer", status: "Away" },
        { name: "Carol", role: "PM", status: "Active" },
      ]}
      columns={[
        { header: "Name", key: "name", width: 12 },
        { header: "Role", key: "role", width: 12 },
        { header: "Status", key: "status", width: 10 },
      ]}
    />
  );
}
