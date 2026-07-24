import { MultiSelect } from "@/registry/bases/opentui/ui/multi-select";

export default function MultiSelectDemo() {
  return (
    <MultiSelect
      options={[
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
        { label: "Gamma", value: "gamma" },
      ]}
    />
  );
}
