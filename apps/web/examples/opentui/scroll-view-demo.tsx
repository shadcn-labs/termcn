import { Box } from "@/registry/bases/opentui/ui/box";
import { ScrollView } from "@/registry/bases/opentui/ui/scroll-view";

export default function ScrollViewDemo() {
  return (
    <Box flexDirection="column" gap={1}>
      <text fg="#666">↑↓ scroll · set contentHeight for thumb size</text>
      <ScrollView contentHeight={8} height={5}>
        <text>Line 1</text>
        <text>Line 2</text>
        <text>Line 3</text>
        <text>Line 4</text>
        <text>Line 5</text>
        <text>Line 6</text>
        <text>Line 7</text>
        <text>Line 8</text>
      </ScrollView>
    </Box>
  );
}
