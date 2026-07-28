import { Select } from "@/registry/bases/ink/ui/select";

export default function SelectDemo() {
  return (
    <Select
      autoFocus
      label="Choose a framework"
      options={[
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
        { label: "Gamma", value: "gamma" },
      ]}
    />
  );
}
