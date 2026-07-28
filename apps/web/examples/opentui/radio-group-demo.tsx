import { RadioGroup } from "@/registry/bases/opentui/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <RadioGroup
      autoFocus
      options={[
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
        { label: "Gamma", value: "gamma" },
      ]}
    />
  );
}
