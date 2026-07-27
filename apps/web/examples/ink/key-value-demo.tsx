import { KeyValue } from "@/registry/bases/ink/ui/key-value";

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
