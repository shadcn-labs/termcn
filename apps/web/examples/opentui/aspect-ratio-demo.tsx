import { AspectRatio } from "@/registry/bases/opentui/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} width={48}>
      <text>Widescreen content</text>
    </AspectRatio>
  );
}
