import { Text } from "ink";

import { Popover } from "@/registry/bases/ink/ui/popover";

export default function PopoverDemo() {
  return (
    <Popover isOpen={true} title="Info" trigger={<Text bold>[?] Help</Text>}>
      <Text>Press Enter to confirm, Esc to cancel.</Text>
    </Popover>
  );
}
