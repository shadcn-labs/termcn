import { Tooltip } from "@/registry/bases/opentui/ui/tooltip";

export default function TooltipDemo() {
  return (
    <Tooltip
      content="Save your current progress"
      position="top"
      isVisible={true}
    >
      <text>
        <b>[S] Save</b>
      </text>
    </Tooltip>
  );
}
