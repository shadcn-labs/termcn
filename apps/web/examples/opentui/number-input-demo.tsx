import { NumberInput } from "@/registry/bases/opentui/ui/number-input";

export default function NumberInputDemo() {
  return (
    <NumberInput
      autoFocus
      defaultValue={1}
      label="Quantity"
      max={100}
      min={0}
      step={1}
    />
  );
}
