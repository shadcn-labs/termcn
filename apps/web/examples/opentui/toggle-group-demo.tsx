import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/registry/bases/opentui/ui/toggle-group";

export default function ToggleGroupDemo() {
  return (
    <ToggleGroup defaultValue={["bold"]} multiple>
      <ToggleGroupItem autoFocus label="Bold" value="bold" />
      <ToggleGroupItem label="Italic" value="italic" />
      <ToggleGroupItem label="Underline" value="underline" />
    </ToggleGroup>
  );
}
