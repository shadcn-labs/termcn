import { Panel } from "@/registry/bases/opentui/ui/panel";

export default function PanelDemo() {
  return (
    <Panel title="System Status" borderStyle="round" width={40}>
      <text>All services operational</text>
    </Panel>
  );
}
