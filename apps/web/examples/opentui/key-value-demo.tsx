import { KeyValue } from "@/registry/bases/opentui/ui/key-value";

export default function KeyValueDemo() {
  return (
    <KeyValue
      items={[
        { key: "Name", value: "my-app" },
        { key: "Version", value: "2.1.0" },
        { key: "License", value: "MIT" },
      ]}
    />
  );
}
