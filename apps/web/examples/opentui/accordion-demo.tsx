import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/bases/opentui/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion defaultValue={["overview"]}>
      <AccordionItem value="overview">
        <AccordionTrigger autoFocus label="Overview" />
        <AccordionContent>
          <text>Composable disclosure sections for terminal interfaces.</text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="shortcuts">
        <AccordionTrigger label="Keyboard shortcuts" />
        <AccordionContent>
          <text>Use arrows to move and Enter or Space to toggle.</text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem disabled value="advanced">
        <AccordionTrigger label="Advanced" />
      </AccordionItem>
    </Accordion>
  );
}
