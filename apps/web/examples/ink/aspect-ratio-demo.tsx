import { Text } from "ink";

import { AspectRatio } from "@/registry/bases/ink/ui/aspect-ratio";

export default function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} width={48}>
      <Text>Widescreen content</Text>
    </AspectRatio>
  );
}
