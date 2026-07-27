import { DatePicker } from "@/registry/bases/opentui/ui/date-picker";

export default function DatePickerDemo() {
  return <DatePicker label="Birth date" value={new Date(2026, 0, 15)} />;
}
