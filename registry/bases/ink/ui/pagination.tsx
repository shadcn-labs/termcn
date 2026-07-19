import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface PaginationProps {
  total: number;
  current?: number;
  defaultCurrent?: number;
  onValueChange?: (page: number) => void;
  onChange?: (page: number) => void;
  showEdges?: boolean;
  siblings?: number;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

const buildPages = (
  total: number,
  current: number,
  siblings: number
): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  const leftSibling = Math.max(2, current - siblings);
  const rightSibling = Math.min(total - 1, current + siblings);

  if (leftSibling > 2) {
    pages.push("...");
  }

  for (let i = leftSibling; i <= rightSibling; i += 1) {
    pages.push(i);
  }

  if (rightSibling < total - 1) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
};

export const Pagination = ({
  total,
  current,
  defaultCurrent = 1,
  onValueChange,
  onChange,
  showEdges = true,
  siblings = 1,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: PaginationProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [internalPage, setInternalPage] = useState(defaultCurrent);
  const activePage = current ?? internalPage;

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(1, page), total);
    if (clamped === activePage) {
      return;
    }
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(clamped);
    } else {
      setInternalPage(clamped);
    }
  };

  const { isFocused } = useInteraction(
    (_input, key) => {
      if (key.leftArrow) {
        goTo(activePage - 1);
      }
      if (key.rightArrow) {
        goTo(activePage + 1);
      }
      if (key.home) {
        goTo(1);
      }
      if (key.end) {
        goTo(total);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const pages = buildPages(total, activePage, siblings);

  return (
    <Box
      aria-role="toolbar"
      aria-state={{ disabled }}
      flexDirection="row"
      alignItems="center"
      gap={1}
    >
      <Text
        aria-label={ariaLabel ?? `Pagination, page ${activePage} of ${total}`}
      >
        {isFocused ? ">" : " "}
      </Text>
      <Text
        aria-hidden
        color={
          activePage === 1 ? theme.colors.mutedForeground : theme.colors.primary
        }
        dimColor={activePage === 1}
      >
        {resolveTerminalSymbol(unicode, "‹", "<")}
      </Text>

      {showEdges && total > 7 ? null : null}

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <Text
              aria-hidden
              key={`ellipsis-${idx}`}
              color={theme.colors.mutedForeground}
            >
              {resolveTerminalSymbol(unicode, "…", "...")}
            </Text>
          );
        }
        const isActive = p === activePage;
        return (
          <Box
            key={p}
            aria-label={`Page ${p}`}
            aria-role="button"
            aria-state={{ disabled, selected: isActive }}
          >
            <Text
              aria-hidden
              color={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
              bold={isActive}
            >
              {isActive ? `[${p}]` : `${p}`}
            </Text>
          </Box>
        );
      })}

      <Text
        aria-hidden
        color={
          activePage === total
            ? theme.colors.mutedForeground
            : theme.colors.primary
        }
        dimColor={activePage === total}
      >
        {resolveTerminalSymbol(unicode, "›", ">")}
      </Text>
    </Box>
  );
};
