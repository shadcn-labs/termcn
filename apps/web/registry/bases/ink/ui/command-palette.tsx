import { useIsScreenReaderEnabled, Box, Text } from "ink";
import { useEffect, useId, useState } from "react";

import { FocusScope, useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";
import {
  graphemeLength,
  removeGraphemeBefore,
} from "@/registry/bases/ink/lib/terminal-text";

export interface Command {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  onSelect?: () => void;
  group?: string;
  disabled?: boolean;
}

export interface CommandPaletteProps {
  commands: Command[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isOpen?: boolean;
  onClose?: () => void;
  placeholder?: string;
  maxItems?: number;
  returnFocusId?: string;
  "aria-label"?: string;
}

const fuzzyMatch = (value: string, query: string): boolean => {
  if (!query) {
    return true;
  }
  const normalizedValue = value.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();
  let queryIndex = 0;
  for (
    let valueIndex = 0;
    valueIndex < normalizedValue.length && queryIndex < normalizedQuery.length;
    valueIndex += 1
  ) {
    if (normalizedValue[valueIndex] === normalizedQuery[queryIndex]) {
      queryIndex += 1;
    }
  }
  return queryIndex === normalizedQuery.length;
};

const fuzzyScore = (value: string, query: string): number => {
  if (!query) {
    return 0;
  }
  const normalizedValue = value.toLocaleLowerCase();
  const normalizedQuery = query.toLocaleLowerCase();
  let score = 0;
  let queryIndex = 0;
  let previousMatch = -1;
  for (
    let valueIndex = 0;
    valueIndex < normalizedValue.length && queryIndex < normalizedQuery.length;
    valueIndex += 1
  ) {
    if (normalizedValue[valueIndex] === normalizedQuery[queryIndex]) {
      score += valueIndex - previousMatch - 1;
      previousMatch = valueIndex;
      queryIndex += 1;
    }
  }
  return score;
};

interface CommandPaletteContentProps {
  commands: Command[];
  controlId: string;
  label: string;
  maxItems: number;
  onClose: () => void;
  placeholder: string;
}

const CommandPaletteContent = ({
  commands,
  controlId,
  label,
  maxItems,
  onClose,
  placeholder,
}: CommandPaletteContentProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const isScreenReaderEnabled = useIsScreenReaderEnabled();
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const filtered = commands
    .filter((command) => fuzzyMatch(command.label, query))
    .toSorted(
      (first, second) =>
        fuzzyScore(first.label, query) - fuzzyScore(second.label, query)
    )
    .slice(0, maxItems);

  useEffect(() => {
    setCursor((current) => Math.max(0, Math.min(current, filtered.length - 1)));
  }, [filtered.length]);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.upArrow) {
        setCursor((current) => Math.max(0, current - 1));
        return;
      }

      if (key.downArrow) {
        setCursor((current) =>
          Math.max(0, Math.min(filtered.length - 1, current + 1))
        );
        return;
      }

      if (key.home) {
        setCursor(0);
        return;
      }

      if (key.end) {
        setCursor(Math.max(0, filtered.length - 1));
        return;
      }

      if (key.return) {
        const command = filtered[cursor];
        if (command && !command.disabled) {
          command.onSelect?.();
          onClose();
        }
        return;
      }

      if (key.backspace) {
        setQuery(
          (current) =>
            removeGraphemeBefore(current, graphemeLength(current)).value
        );
        setCursor(0);
        return;
      }

      if (key.delete || key.tab || key.ctrl || key.meta) {
        return;
      }

      if (input) {
        setQuery((current) => current + input);
        setCursor(0);
      }
    },
    { autoFocus: true, id: controlId }
  );

  const groups = new Map<string | undefined, Command[]>();
  for (const command of filtered) {
    const groupCommands = groups.get(command.group) ?? [];
    groupCommands.push(command);
    groups.set(command.group, groupCommands);
  }
  const indexById = new Map(
    filtered.map((command, index) => [command.id, index] as const)
  );

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle("round", unicode)}
      borderColor={theme.colors.focusRing}
      paddingX={1}
    >
      <Text aria-label={label}>{""}</Text>
      <Box
        aria-label={`${label} query: ${query || "empty"}`}
        aria-role="combobox"
        aria-state={{ expanded: true }}
        borderStyle={resolveBorderStyle("single", unicode)}
        borderColor={theme.colors.border}
        paddingX={1}
      >
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {unicode ? "⌘ " : "> "}
        </Text>
        <Text
          aria-hidden
          color={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </Text>
        {isFocused && !isScreenReaderEnabled && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {unicode ? "█" : "|"}
          </Text>
        )}
      </Box>

      {filtered.length === 0 ? (
        <Box paddingX={1} paddingY={0}>
          <Text color={theme.colors.mutedForeground} dimColor>
            No commands found
          </Text>
        </Box>
      ) : (
        <Box aria-role="listbox" flexDirection="column">
          {[...groups.entries()].map(([group, groupCommands]) => (
            <Box key={group ?? "_"} flexDirection="column">
              {group && (
                <Box paddingX={1}>
                  <Text color={theme.colors.mutedForeground} dimColor bold>
                    {group}
                  </Text>
                </Box>
              )}
              {groupCommands.map((command) => {
                const index = indexById.get(command.id) ?? -1;
                const isCursor = index === cursor;
                return (
                  <Box
                    key={command.id}
                    aria-label={
                      command.description
                        ? `${command.label}: ${command.description}`
                        : command.label
                    }
                    aria-role="option"
                    aria-state={{
                      disabled: command.disabled,
                      selected: isCursor,
                    }}
                    paddingX={1}
                  >
                    <Box aria-hidden flexGrow={1}>
                      <Text
                        color={
                          isCursor
                            ? theme.colors.selectionForeground
                            : theme.colors.foreground
                        }
                        bold={isCursor}
                        inverse={isCursor}
                        dimColor={command.disabled}
                      >
                        {command.label}
                      </Text>
                      {command.description && (
                        <Text color={theme.colors.mutedForeground} dimColor>
                          {`${unicode ? " — " : " - "}${command.description}`}
                        </Text>
                      )}
                    </Box>
                    {command.shortcut && (
                      <Text aria-hidden color={theme.colors.accent} dimColor>
                        {command.shortcut}
                      </Text>
                    )}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      )}

      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {unicode
          ? "↑↓: navigate · Enter: run · Esc: close"
          : "up/down: navigate - Enter: run - Esc: close"}
      </Text>
    </Box>
  );
};

export const CommandPalette = ({
  commands,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  isOpen,
  onClose,
  placeholder = "Type a command...",
  maxItems = 8,
  returnFocusId,
  "aria-label": ariaLabel = "Command palette",
}: CommandPaletteProps) => {
  const generatedId = useId();
  const controlId = `command-palette-${generatedId}`;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? isOpen ?? internalOpen;

  const close = () => {
    if (controlledOpen === undefined && isOpen === undefined) {
      setInternalOpen(false);
    }
    onOpenChange?.(false);
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <FocusScope
      active={open}
      initialFocusId={controlId}
      returnFocusId={returnFocusId}
      onEscapeKey={close}
    >
      <CommandPaletteContent
        commands={commands}
        controlId={controlId}
        label={ariaLabel}
        maxItems={maxItems}
        onClose={close}
        placeholder={placeholder}
      />
    </FocusScope>
  );
};
