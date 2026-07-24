import { Box, Text } from "ink";

import { ScrollView } from "@/registry/bases/ink/ui/scroll-view";

const lines = Array.from({ length: 12 }, (_, i) => `Line ${i + 1}`);

export default function ScrollViewScrollbar() {
  return (
    <Box flexDirection="column" gap={1}>
      <Text dimColor>↑↓ PgUp/PgDn · Home/End · proportional thumb</Text>
      <ScrollView
        contentHeight={lines.length}
        height={5}
        thumbChar="▐"
        trackChar="│"
      >
        {lines.map((line) => (
          <Text key={line}>{line}</Text>
        ))}
      </ScrollView>
    </Box>
  );
}
