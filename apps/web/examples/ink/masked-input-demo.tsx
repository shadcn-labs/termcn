import { MaskedInput } from "@/registry/bases/ink/ui/masked-input";

export default function MaskedInputDemo() {
  return (
    <MaskedInput
      mask="(###) ###-####"
      label="Phone Number"
      placeholder="(555) 123-4567"
    />
  );
}
