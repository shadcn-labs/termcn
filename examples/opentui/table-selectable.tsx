import { useState } from "react";

import { Box } from "@/registry/bases/opentui/ui/box";
import { Table } from "@/registry/bases/opentui/ui/table";

const data = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

export default function TableSelectable() {
  const [picked, setPicked] = useState<string>("");

  return (
    <Box flexDirection="column" gap={1}>
      <Table
        columns={[
          { header: "ID", key: "id" },
          { header: "Name", key: "name" },
        ]}
        data={data}
        selectable
        onSelect={(row) => setPicked(`${row.id}: ${row.name}`)}
      />
      {picked ? (
        <text>
          <dim>Selected: {picked}</dim>
        </text>
      ) : (
        <text>
          <dim>↑↓ move · Enter select</dim>
        </text>
      )}
    </Box>
  );
}
