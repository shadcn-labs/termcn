import { TextArea } from "@/registry/bases/ink/ui/text-area";

export default function TextAreaDemo() {
  return (
    <TextArea
      label="Description"
      placeholder="Enter a description..."
      rows={4}
    />
  );
}
