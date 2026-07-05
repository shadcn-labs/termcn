/* @jsxImportSource @opentui/react */

import type { Key } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  <box
    borderStyle="single"
    borderColor={color}
    paddingLeft={1}
    paddingRight={1}
  >
    <text fg={color}>
      <b>{label}</b>
    </text>
  </box>
);

const ShortcutRow = ({
  shortcut,
  keyColor,
  descColor,
}: {
  key?: Key | null;
  shortcut: Shortcut;
  keyColor: string;
  descColor: string;
}) => (
  <box gap={1} alignItems="center">
    <KeyLabel label={shortcut.key} color={keyColor} />
    <text fg={descColor}>{shortcut.description}</text>
  </box>
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
    <box flexDirection="column" gap={0}>
      {rows.map((row, ri) => (
        <box key={ri} gap={3}>
          {row.map((s, ci) => (
            <ShortcutRow
              key={ci}
              shortcut={s}
              keyColor={theme.colors.primary}
              descColor={theme.colors.foreground}
            />
          ))}
        </box>
      ))}
    </box>
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
    const grouped: Record<string, Shortcut[]> = {};
    for (const s of shortcuts) {
      const cat = s.category ?? "General";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(s);
    }

    return (
      <box flexDirection="column" gap={1}>
        {title && (
          <text fg={theme.colors.primary}>
            <b>{`⌨ ${title}`}</b>
          </text>
        )}
        {...Object.entries(grouped).map(([category, items]) => (
          <box key={category} flexDirection="column" gap={0}>
            <text fg={theme.colors.mutedForeground}>
              <b>
                <u>{category}</u>
              </b>
            </text>
            {columns > 1 ? (
              <ShortcutGrid columns={columns} items={items} theme={theme} />
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
          </box>
        ))}
      </box>
    );
  }

  return (
    <box flexDirection="column" gap={1}>
      {title && (
        <text fg={theme.colors.primary}>
          <b>{`⌨ ${title}`}</b>
        </text>
      )}
      {columns > 1 ? (
        <ShortcutGrid columns={columns} items={shortcuts} theme={theme} />
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
    </box>
  );
};
