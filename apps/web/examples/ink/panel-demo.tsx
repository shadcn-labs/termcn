import { Text } from "ink";

import { Panel } from "@/registry/bases/ink/ui/panel";

export default function PanelDemo() {
  return (
    <Panel title="System Status" borderStyle="round" width={40}>
      <Text>All services operational</Text>
    </Panel>
  );
}
