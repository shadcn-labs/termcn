import { Switch } from "@/registry/bases/opentui/ui/switch";

export default function SwitchDemo() {
  return (
    <box flexDirection="column" gap={1}>
      <Switch autoFocus defaultChecked label="Desktop notifications" />
      <Switch label="Sound effects" symbols="ascii" />
      <Switch disabled label="Managed by your organization" />
    </box>
  );
}
