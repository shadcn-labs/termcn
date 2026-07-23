import { Box, Text } from "ink";

import { useTheme } from "@/hooks/use-theme";

export interface DefinitionItem {
  term: string;
  description: string;
}

export interface DefinitionProps {
  items: DefinitionItem[];
  termColor?: string;
}

export const Definition = ({ items, termColor }: DefinitionProps) => {
  const theme = useTheme();
  const resolvedTermColor = termColor ?? theme.colors.primary;

  return (
    <Box flexDirection="column" aria-role="list">
      {items.map((item, idx) => (
        <Box
          key={idx}
          flexDirection="column"
          marginBottom={idx < items.length - 1 ? 1 : 0}
          aria-role="listitem"
          aria-label={`${item.term}: ${item.description}`}
        >
          <Text bold color={resolvedTermColor}>
            {item.term}
          </Text>
          <Box paddingLeft={2}>
            <Text color={theme.colors.foreground}>{item.description}</Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
