import { Text } from "ink";

import { Card } from "@/registry/bases/ink/ui/card";

export default function CardDemo() {
  return (
    <Card title="System Info" subtitle="Local machine">
      <Text>CPU: 4 cores @ 3.2 GHz</Text>
      <Text>Memory: 16 GB</Text>
    </Card>
  );
}
