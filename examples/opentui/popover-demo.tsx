import { Popover } from "@/registry/bases/opentui/ui/popover";

export default function PopoverDemo() {
  return (
    <Popover
      isOpen={true}
      title="Info"
      trigger={
        <text>
          <b>[?] Help</b>
        </text>
      }
    >
      <text>Press Enter to confirm, Esc to cancel.</text>
    </Popover>
  );
}
