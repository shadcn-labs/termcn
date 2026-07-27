/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useMemo, useCallback } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";
import type { BorderStyle } from "@/registry/bases/opentui/ui/types";

export interface SearchInputProps<T = string> {
  options?: T[];
  getValue?: (item: T) => string;
  value?: string;
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
  id: _id,
  borderStyle = "rounded",
  paddingX = 1,
  cursor = "█",
  searchIcon = "🔍 ",
  resultCursor = "› ",
}: SearchInputProps<T>) => {
  const [internalValue, setInternalValue] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const theme = useTheme();
  const [isFocused] = useState(true);

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
    if (onChange) {
      onChange(newQuery);
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

  useKeyboard((key) => {
    if (!isFocused) {
      return;
    }
    if (key.name === "escape") {
      setQuery("");
      setShowResults(false);
      setSelectedIndex(0);
      return;
    }
    if (key.name === "up") {
      if (showResults && filteredResults.length > 0) {
        setSelectedIndex((i) => Math.max(0, i - 1));
      }
      return;
    }
    if (key.name === "down") {
      if (filteredResults.length > 0) {
        setShowResults(true);
        setSelectedIndex((i) => Math.min(filteredResults.length - 1, i + 1));
      }
      return;
    }
    if (key.name === "return") {
      if (showResults && filteredResults.length > 0) {
        onSelect?.(filteredResults[selectedIndex]);
        setQuery(getItemValue(filteredResults[selectedIndex]));
        setShowResults(false);
        setSelectedIndex(0);
      }
      return;
    }
    if (key.name === "backspace" || key.name === "delete") {
      const newQuery = query.slice(0, -1);
      setQuery(newQuery);
      setSelectedIndex(0);
      if (newQuery.length === 0) {
        setShowResults(false);
      }
      return;
    }
    if (key.name === "tab") {
      return;
    }
    if (key.name && key.name.length === 1) {
      const newQuery = query + key.name;
      setQuery(newQuery);
      setSelectedIndex(0);
      if (options && options.length > 0) {
        setShowResults(true);
      }
    }
  });

  const borderColor = isFocused ? theme.colors.focusRing : theme.colors.border;
  const hasResults = showResults && filteredResults.length > 0;

  return (
    <box flexDirection="column">
      {label && (
        <text>
          <b>{label}</b>
        </text>
      )}
      <box paddingLeft={paddingX} paddingRight={paddingX}>
        <text fg={theme.colors.mutedForeground}>{searchIcon}</text>
        <text
          fg={query ? theme.colors.foreground : theme.colors.mutedForeground}
        >
          {query || placeholder}
        </text>
        {isFocused && <text fg={theme.colors.focusRing}>{cursor}</text>}
      </box>
      {hasResults && (
        <box flexDirection="column" paddingLeft={2}>
          {filteredResults.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <box key={idx} flexDirection="row">
                <text
                  fg={
                    isSelected
                      ? theme.colors.focusRing
                      : theme.colors.mutedForeground
                  }
                >
                  {isSelected ? resultCursor : " ".repeat(resultCursor.length)}
                </text>
                <text
                  fg={
                    isSelected
                      ? theme.colors.foreground
                      : theme.colors.mutedForeground
                  }
                >
                  {getItemValue(item)}
                </text>
              </box>
            );
          })}
        </box>
      )}
    </box>
  );
};
