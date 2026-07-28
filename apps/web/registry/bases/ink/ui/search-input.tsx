import { Box, Text } from "ink";
import React, { useState, useMemo, useCallback, useEffect } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useFocus } from "@/hooks/use-focus";
import { useInput } from "@/hooks/use-input";
import type { BorderStyle } from "@/registry/bases/ink/ui/types";

export interface SearchInputProps<T = string> {
  options?: T[];
  getValue?: (item: T) => string;
  value?: string;
  onChange?: (query: string) => void;
  onSelect?: (item: T) => void;
  placeholder?: string;
  label?: string;
  maxResults?: number;
  autoFocus?: boolean;
  isDisabled?: boolean;
  id?: string;
  borderStyle?: BorderStyle;
  paddingX?: number;
  cursor?: string;
  searchIcon?: string;
  resultCursor?: string;
}

export const SearchInput = <T = string,>({
  options,
  getValue,
  value: controlledValue,
  onChange,
  onSelect,
  placeholder = "Search...",
  label,
  maxResults = 5,
  autoFocus = false,
  isDisabled = false,
  id,
  borderStyle = "round",
  paddingX = 1,
  cursor = "█",
  searchIcon = "🔍 ",
  resultCursor = "› ",
}: SearchInputProps<T>) => {
  const [internalValue, setInternalValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const theme = useTheme();
  const { isFocused } = useFocus({
    autoFocus,
    id,
    isActive: !isDisabled,
  });

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
    if (controlledValue === undefined) {
      setInternalValue(newQuery);
    }
    onChange?.(newQuery);
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

  useEffect(() => {
    if (selectedIndex >= filteredResults.length) {
      setSelectedIndex(Math.max(0, filteredResults.length - 1));
    }
  }, [filteredResults.length, selectedIndex]);

  useInput(
    (input, key) => {
      if (!isFocused) {
        return;
      }

      if (key.escape) {
        setQuery("");
        setShowResults(false);
        setSelectedIndex(0);
        return;
      }

      if (key.upArrow) {
        if (showResults && filteredResults.length > 0) {
          setSelectedIndex((index) => Math.max(0, index - 1));
        }
        return;
      }

      if (key.downArrow) {
        if (filteredResults.length > 0) {
          setShowResults(true);
          setSelectedIndex((index) =>
            Math.min(filteredResults.length - 1, index + 1)
          );
        }
        return;
      }

      if (key.return) {
        if (showResults && filteredResults.length > 0) {
          const selected = filteredResults[selectedIndex];
          if (selected !== undefined) {
            onSelect?.(selected);
            setQuery(getItemValue(selected));
            setShowResults(false);
            setSelectedIndex(0);
          }
        }
        return;
      }

      if (key.backspace || key.delete) {
        const newQuery = query.slice(0, -1);
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

      if (input) {
        const newQuery = query + input;
        setQuery(newQuery);
        setSelectedIndex(0);
        if (options && options.length > 0) {
          setShowResults(true);
        }
      }
    },
    { isActive: isFocused && !isDisabled }
  );

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const hasResults = showResults && filteredResults.length > 0;

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}
      <Box
        borderStyle={borderStyle}
        borderColor={borderColor}
        paddingX={paddingX}
      >
        <Text color={theme.colors.mutedForeground}>{searchIcon}</Text>
        <Text
          color={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </Text>
        {isFocused && <Text color={theme.colors.focusRing}>{cursor}</Text>}
      </Box>
      {hasResults && (
        <Box flexDirection="column" paddingLeft={2}>
          {filteredResults.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <Box key={idx} flexDirection="row">
                <Text
                  color={
                    isSelected
                      ? theme.colors.focusRing
                      : theme.colors.mutedForeground
                  }
                >
                  {isSelected ? resultCursor : " ".repeat(resultCursor.length)}
                </Text>
                <Text
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
