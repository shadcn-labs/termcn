import { Box, Text } from "ink";
import React, { useState, useMemo, useCallback } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";
import {
  graphemeLength,
  removeGraphemeBefore,
} from "@/registry/bases/ink/lib/terminal-text";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface SearchInputProps<T = string> {
  options?: T[];
  getValue?: (item: T) => string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (query: string) => void;
  onChange?: (query: string) => void;
  onSelect?: (item: T) => void;
  placeholder?: string;
  label?: string;
  maxResults?: number;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
  searchIcon?: string;
  resultCursor?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

export const SearchInput = <T = string,>({
  options,
  getValue,
  value: controlledValue,
  defaultValue = "",
  onValueChange,
  onChange,
  onSelect,
  placeholder = "Search...",
  label,
  maxResults = 5,
  id,
  borderStyle = "round",
  paddingX = 1,
  cursor,
  searchIcon,
  resultCursor,
  autoFocus = false,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: SearchInputProps<T>) => {
  const unicode = useUnicode();
  const resolvedCursor = cursor ?? resolveTerminalSymbol(unicode, "█", "|");
  const resolvedSearchIcon =
    searchIcon ?? resolveTerminalSymbol(unicode, "🔍 ", "Search: ");
  const resolvedResultCursor =
    resultCursor ?? resolveTerminalSymbol(unicode, "› ", "> ");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const theme = useTheme();

  const query = controlledValue ?? internalValue;

  const getItemValue = useCallback(
    (item: T): string => {
      if (getValue) {
        return getValue(item);
      }
      return String(item);
    },
    [getValue]
  );

  const setQuery = (newQuery: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(newQuery);
    } else {
      setInternalValue(newQuery);
    }
  };

  const filteredResults = useMemo(() => {
    if (!options || options.length === 0) {
      return [];
    }
    if (!query) {
      return options.slice(0, maxResults);
    }
    const lower = query.toLowerCase();
    return options
      .filter((item) => getItemValue(item).toLowerCase().includes(lower))
      .slice(0, maxResults);
  }, [options, query, maxResults, getItemValue]);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.escape) {
        setQuery("");
        setShowResults(false);
        setSelectedIndex(0);
        return;
      }

      if (key.upArrow) {
        if (showResults && filteredResults.length > 0) {
          setSelectedIndex((i) => Math.max(0, i - 1));
        }
        return;
      }

      if (key.downArrow) {
        if (filteredResults.length > 0) {
          setShowResults(true);
          setSelectedIndex((i) => Math.min(filteredResults.length - 1, i + 1));
        }
        return;
      }

      if (key.return) {
        if (showResults && filteredResults.length > 0) {
          onSelect?.(filteredResults[selectedIndex]);
          setQuery(getItemValue(filteredResults[selectedIndex]));
          setShowResults(false);
          setSelectedIndex(0);
        }
        return;
      }

      if (readOnly) {
        return;
      }

      if (key.backspace) {
        const newQuery = removeGraphemeBefore(
          query,
          graphemeLength(query)
        ).value;
        setQuery(newQuery);
        setSelectedIndex(0);
        if (newQuery.length === 0) {
          setShowResults(false);
        }
        return;
      }

      if (key.tab) {
        return;
      }

      if (input && !(key.ctrl || key.meta)) {
        const newQuery = query + input;
        setQuery(newQuery);
        setSelectedIndex(0);
        if (options && options.length > 0) {
          setShowResults(true);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const hasResults = showResults && filteredResults.length > 0;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        aria-label={ariaLabel ?? `${label ?? "Search"}: ${query || "empty"}`}
        aria-role="combobox"
        aria-state={{
          disabled,
          expanded: hasResults,
          readonly: readOnly,
          required,
        }}
        borderStyle={resolveBorderStyle(borderStyle, unicode)}
        borderColor={borderColor}
        paddingX={paddingX}
      >
        <Text aria-hidden color={theme.colors.mutedForeground}>
          {resolvedSearchIcon}
        </Text>
        <Text
          aria-hidden
          color={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </Text>
        {isFocused && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {resolvedCursor}
          </Text>
        )}
      </Box>
      {hasResults && (
        <Box aria-role="listbox" flexDirection="column" paddingLeft={2}>
          {filteredResults.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Box
                key={idx}
                aria-label={getItemValue(item)}
                aria-role="option"
                aria-state={{ selected: isSelected }}
                flexDirection="row"
              >
                <Text
                  aria-hidden
                  color={
                    isSelected
                      ? theme.colors.focusRing
                      : theme.colors.mutedForeground
                  }
                >
                  {isSelected
                    ? resolvedResultCursor
                    : " ".repeat(resolvedResultCursor.length)}
                </Text>
                <Text
                  aria-hidden
                  color={
                    isSelected
                      ? theme.colors.foreground
                      : theme.colors.mutedForeground
                  }
                >
                  {getItemValue(item)}
                </Text>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
