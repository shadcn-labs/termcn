import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/bases/opentui/ui/collapsible";

export default function CollapsibleDemo() {
  return (
    <Collapsible defaultOpen>
      <CollapsibleTrigger autoFocus label="Build details" />
      <CollapsibleContent>
        <text>12 tasks completed in 1.8s.</text>
      </CollapsibleContent>
    </Collapsible>
  );
}
