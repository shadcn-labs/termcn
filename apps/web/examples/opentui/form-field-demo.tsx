import { FormField } from "@/registry/bases/opentui/ui/form-field";

export default function FormFieldDemo() {
  return (
    <FormField label="Username" hint="Must be unique" required>
      <text>my-input-here</text>
    </FormField>
  );
}
