import { Box, Text } from "ink";
import { useState } from "react";

import { Table } from "@/registry/bases/ink/ui/table";

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
        <Text dimColor>Selected: {picked}</Text>
      ) : (
        <Text dimColor>↑↓ move · Enter select</Text>
      )}
    </Box>
  );
}
