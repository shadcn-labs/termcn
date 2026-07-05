/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  showEdges: _showEdges = true,
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

  useKeyboard((key) => {
    if (key.name === "left") {
      goTo(activePage - 1);
    }
    if (key.name === "right") {
      goTo(activePage + 1);
    }
  });

  const pages = buildPages(total, activePage, siblings);

  return (
    <box flexDirection="row" alignItems="center" gap={1}>
      <text
        fg={
          activePage === 1 ? theme.colors.mutedForeground : theme.colors.primary
        }
      >
        ‹
      </text>

      {pages.map((p, idx) => {
        if (p === "...") {
          return (
            <text key={`ellipsis-${idx}`} fg={theme.colors.mutedForeground}>
              …
            </text>
          );
        }
        const isActive = p === activePage;
        return (
          <text
            key={p}
            fg={isActive ? theme.colors.primary : theme.colors.mutedForeground}
          >
            {isActive ? <b>{`[${p}]`}</b> : `${p}`}
          </text>
        );
      })}

      <text
        fg={
          activePage === total
            ? theme.colors.mutedForeground
            : theme.colors.primary
        }
      >
        ›
      </text>
    </box>
  );
};
