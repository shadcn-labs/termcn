import { Box, Text } from "ink";

import { useTheme } from "@/components/ui/ink-theme-provider";

export interface Shortcut {
  key: string;
  description: string;
  category?: string;
}

export interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  columns?: number;
  title?: string;
}

const KeyLabel = ({ label, color }: { label: string; color: string }) => (
  <Box borderStyle="single" borderColor={color} paddingX={1}>
    <Text color={color} bold>
      {label}
    </Text>
  </Box>
);

const ShortcutRow = ({
  shortcut,
  keyColor,
  descColor,
}: {
  shortcut: Shortcut;
  keyColor: string;
  descColor: string;
}) => (
  <Box gap={1} alignItems="center">
    <KeyLabel label={shortcut.key} color={keyColor} />
    <Text color={descColor}>{shortcut.description}</Text>
  </Box>
);

const ShortcutGrid = ({
  items,
  columns,
  theme,
}: {
  items: Shortcut[];
  columns: number;
  theme: ReturnType<typeof useTheme>;
}) => {
  const rows: Shortcut[][] = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <Box flexDirection="column" gap={0}>
      {rows.map((row, ri) => (
        <Box key={ri} gap={3}>
          {row.map((s, ci) => (
            <ShortcutRow
              key={ci}
              shortcut={s}
              keyColor={theme.colors.primary}
              descColor={theme.colors.foreground}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
};

export const KeyboardShortcuts = ({
  shortcuts,
  columns = 1,
  title,
}: KeyboardShortcutsProps) => {
  const theme = useTheme();

  const hasCategories = shortcuts.some((s) => s.category);

  if (hasCategories) {
    const grouped: Record<string, Shortcut[]> = {
      /* noop */
    };
    for (const s of shortcuts) {
      const cat = s.category ?? "General";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(s);
    }

    return (
      <Box flexDirection="column" gap={1}>
        {title && (
          <Text color={theme.colors.primary} bold>
            ⌨ {title}
          </Text>
        )}
        {Object.entries(grouped).map(([category, items]) => (
          <Box key={category} flexDirection="column" gap={0}>
            <Text color={theme.colors.mutedForeground} bold underline>
              {category}
            </Text>
            {columns > 1 ? (
              <ShortcutGrid items={items} columns={columns} theme={theme} />
            ) : (
              items.map((s, i) => (
                <ShortcutRow
                  key={i}
                  shortcut={s}
                  keyColor={theme.colors.primary}
                  descColor={theme.colors.foreground}
                />
              ))
            )}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box flexDirection="column" gap={1}>
      {title && (
        <Text color={theme.colors.primary} bold>
          ⌨ {title}
        </Text>
      )}
      {columns > 1 ? (
        <ShortcutGrid items={shortcuts} columns={columns} theme={theme} />
      ) : (
        shortcuts.map((s, i) => (
          <ShortcutRow
            key={i}
            shortcut={s}
            keyColor={theme.colors.primary}
            descColor={theme.colors.foreground}
          />
        ))
      )}
    </Box>
  );
};
