import { TimePicker } from "@/registry/bases/ink/ui/time-picker";

export default function TimePickerDemo() {
  return <TimePicker label="Meeting time" value={{ hours: 14, minutes: 30 }} />;
}
