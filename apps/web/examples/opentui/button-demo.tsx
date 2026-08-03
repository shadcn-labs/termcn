import { Button } from "@/registry/bases/opentui/ui/button";

export default function ButtonDemo() {
  return (
    <box flexDirection="row" gap={1}>
      <Button autoFocus label="Continue" />
      <Button intent="neutral" label="Cancel" />
      <Button disabled label="Unavailable" />
    </box>
  );
}
