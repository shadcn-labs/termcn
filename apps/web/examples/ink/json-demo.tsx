import { JSONView } from "@/registry/bases/ink/ui/json";

export default function JSONDemo() {
  return (
    <JSONView
      label="package.json"
      data={{
        dependencies: {
          ink: "^5.0.0",
          react: "^18.0.0",
        },
        name: "my-cli",
        version: "1.0.0",
      }}
    />
  );
}
