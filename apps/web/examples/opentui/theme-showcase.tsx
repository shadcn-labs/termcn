import { useTheme } from "@/components/ui/opentui-theme-provider";
import { Box } from "@/registry/bases/opentui/ui/box";

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
      <text fg={theme.colors.primary}>
        <b>{theme.name}</b>
      </text>
      <text fg={theme.colors.mutedForeground}>
        Preview the token palette inside a browser terminal.
      </text>
      <Box flexDirection="column" marginTop={1}>
        {palette.map((token) => (
          <text fg={token.value} key={token.label}>
            {token.label.padEnd(10)} {token.value}
          </text>
        ))}
      </Box>
    </Box>
  );
}
