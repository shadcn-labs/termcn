import { Table } from "@/registry/bases/ink/ui/table";

const data = [
  { name: "termcn", status: "ready", version: "0.1.0" },
  { name: "cli-utils", status: "upstream", version: "1.4.3" },
  { name: "ink-web", status: "ready", version: "0.2.0" },
];

export default function TableDemo() {
  return (
    <Table
      columns={[
        { header: "Name", key: "name" },
        { header: "Status", key: "status" },
        { header: "Version", key: "version" },
      ]}
      data={data}
    />
  );
}
