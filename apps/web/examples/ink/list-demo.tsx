import { List } from "@/registry/bases/ink/ui/list";

export default function ListDemo() {
  return (
    <List
      items={[
        { description: "Typed JavaScript", key: "ts", label: "TypeScript" },
        { description: "Systems language", key: "rs", label: "Rust" },
        { description: "Cloud-native language", key: "go", label: "Go" },
      ]}
    />
  );
}
