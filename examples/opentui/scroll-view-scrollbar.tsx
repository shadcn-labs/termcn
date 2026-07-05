import { Box } from "@/registry/bases/opentui/ui/box";
import { ScrollView } from "@/registry/bases/opentui/ui/scroll-view";

const lines = Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`);

export default function ScrollViewScrollbar() {
  return (
    <Box flexDirection="column" gap={1}>
      <text fg="#666">↑↓ PgUp/PgDn · Home/End · proportional thumb</text>
      <ScrollView
        contentHeight={lines.length}
        height={5}
        thumbChar="▐"
        trackChar="│"
      >
        {lines.map((line) => (
          <text key={line}>{line}</text>
        ))}
      </ScrollView>
    </Box>
  );
}
