import { Text } from "ink";

import { Form } from "@/registry/bases/ink/ui/form";

export default function FormDemo() {
  return (
    <Form
      initialValues={{ email: "", name: "" }}
      fields={[
        { name: "name", validate: (v) => (v ? null : "Name is required") },
        { name: "email", validate: (v) => (v ? null : "Email is required") },
      ]}
    >
      <Text>Name and email form (Ctrl+S to submit)</Text>
    </Form>
  );
}
