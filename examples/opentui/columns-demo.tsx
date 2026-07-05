import { Columns } from "@/registry/bases/opentui/ui/columns";

export default function ColumnsDemo() {
  return (
    <Columns gap={2} align="center">
      <text>Left</text>
      <text>Center</text>
      <text>Right</text>
    </Columns>
  );
}
