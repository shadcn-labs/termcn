import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface PaginationProps {
  total: number;
  current: number;
  onChange?: (page: number) => void;
  showEdges?: boolean;
  siblings?: number;
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
  onChange,
  showEdges = true,
  siblings = 1,
}: PaginationProps) => {
  const theme = useTheme();
  const [internalPage, setInternalPage] = useState(current);
  const activePage = current ?? internalPage;

  const goTo = (page: number) => {
    const clamped = Math.min(Math.max(1, page), total);
    if (clamped === activePage) {
      return;
    }
    if (onChange) {
      onChange(clamped);
    } else {
      setInternalPage(clamped);
    }
  };

  useInput((_input, key) => {
    if (key.leftArrow) {
      goTo(activePage - 1);
    }
    if (key.rightArrow) {
      goTo(activePage + 1);
    }
  });

  const pages = buildPages(total, activePage, siblings);

  return (
    <Box flexDirection="row" alignItems="center" gap={1}>
      <Text
        color={
          activePage === 1 ? theme.colors.mutedForeground : theme.colors.primary
        }
        dimColor={activePage === 1}
      >
        ‹
      </Text>

      {showEdges && total > 7 ? null : null}

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <Text key={`ellipsis-${idx}`} color={theme.colors.mutedForeground}>
              …
            </Text>
          );
        }
        const isActive = p === activePage;
        return (
          <Text
            key={p}
            color={
              isActive ? theme.colors.primary : theme.colors.mutedForeground
            }
            bold={isActive}
          >
            {isActive ? `[${p}]` : `${p}`}
          </Text>
        );
      })}

      <Text
        color={
          activePage === total
            ? theme.colors.mutedForeground
            : theme.colors.primary
        }
        dimColor={activePage === total}
      >
        ›
      </Text>
    </Box>
  );
};
