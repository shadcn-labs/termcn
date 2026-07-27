import { Text } from "ink";

import { FormField } from "@/registry/bases/ink/ui/form-field";

export default function FormFieldDemo() {
  return (
    <FormField label="Username" hint="Must be unique" required>
      <Text>my-input-here</Text>
    </FormField>
  );
}
