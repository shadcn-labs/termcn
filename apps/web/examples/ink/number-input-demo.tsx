import { NumberInput } from "@/registry/bases/ink/ui/number-input";

export default function NumberInputDemo() {
  return <NumberInput label="Quantity" min={0} max={100} step={1} />;
}
