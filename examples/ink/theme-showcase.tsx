import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export default function ThemeShowcasePreview() {
  const theme = useTheme();

  const palette = [
    { label: "Primary", value: theme.colors.primary },
    { label: "Accent", value: theme.colors.accent },
    { label: "Success", value: theme.colors.success },
    { label: "Warning", value: theme.colors.warning },
    { label: "Error", value: theme.colors.error },
    { label: "Info", value: theme.colors.info },
  ];

  return (
    <Box flexDirection="column">
      <Text bold color={theme.colors.primary}>
        {theme.name}
      </Text>
      <Text color={theme.colors.mutedForeground}>
        Preview the token palette inside a browser terminal.
      </Text>
      <Box flexDirection="column" marginTop={1}>
        {palette.map((token) => (
          <Text key={token.label} color={token.value}>
            {token.label.padEnd(10)} {token.value}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
