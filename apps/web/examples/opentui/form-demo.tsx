import { Form } from "@/registry/bases/opentui/ui/form";

export default function FormDemo() {
  return (
    <Form
      initialValues={{ email: "", name: "" }}
      fields={[
        { name: "name", validate: (v) => (v ? null : "Name is required") },
        { name: "email", validate: (v) => (v ? null : "Email is required") },
      ]}
    >
      <text>Name and email form (Ctrl+S to submit)</text>
    </Form>
  );
}
