import { RadioGroup } from "@/registry/bases/ink/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <RadioGroup
      options={[
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
        { label: "Gamma", value: "gamma" },
      ]}
    />
  );
}
