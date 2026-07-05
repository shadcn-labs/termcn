import { Card } from "@/registry/bases/opentui/ui/card";

export default function CardDemo() {
  return (
    <Card title="System Info" subtitle="Local machine">
      <text>CPU: 4 cores @ 3.2 GHz</text>
      <text>Memory: 16 GB</text>
    </Card>
  );
}
