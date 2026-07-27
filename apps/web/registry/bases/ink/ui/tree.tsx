import { Box, Text } from "ink";
import React, { useEffect, useMemo, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";

export interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
  icon?: string;
  disabled?: boolean;
}

export interface TreeProps extends InteractionProps {
  nodes: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  defaultExpanded?: string[];
  expandedIcon?: string;
  collapsedIcon?: string;
  leafIcon?: string;
  "aria-label"?: string;
}

interface FlatNode {
  node: TreeNode;
  depth: number;
  hasChildren: boolean;
}

const flattenTree = (
  nodes: TreeNode[],
  expandedKeys: Set<string>,
  depth = 0
): FlatNode[] => {
  const result: FlatNode[] = [];
  for (const node of nodes) {
    const hasChildren = Boolean(node.children && node.children.length > 0);
    result.push({ depth, hasChildren, node });
    if (hasChildren && expandedKeys.has(node.key)) {
      const childFlat = flattenTree(
        node.children ?? [],
        expandedKeys,
        depth + 1
      );
      result.push(...childFlat);
    }
  }
  return result;
};

export const Tree = ({
  nodes,
  onSelect,
  defaultExpanded = [],
  expandedIcon,
  collapsedIcon,
  leafIcon,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Tree",
}: TreeProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedExpandedIcon =
    expandedIcon ?? resolveTerminalSymbol(unicode, "▼", "v");
  const resolvedCollapsedIcon =
    collapsedIcon ?? resolveTerminalSymbol(unicode, "▶", ">");
  const resolvedLeafIcon = leafIcon ?? resolveTerminalSymbol(unicode, "•", "*");
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(defaultExpanded)
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const flatNodes = useMemo(
    () => flattenTree(nodes, expandedKeys),
    [nodes, expandedKeys]
  );

  const { isFocused } = useInteraction(
    (_input, key) => {
      const current = flatNodes[activeIndex];

      if (key.upArrow) {
        setActiveIndex((i) => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setActiveIndex((i) => Math.min(flatNodes.length - 1, i + 1));
      } else if (key.home) {
        setActiveIndex(0);
      } else if (key.end) {
        setActiveIndex(Math.max(0, flatNodes.length - 1));
      } else if (key.rightArrow || _input === " ") {
        if (current?.hasChildren && !expandedKeys.has(current.node.key)) {
          setExpandedKeys((prev) => new Set([...prev, current.node.key]));
        }
      } else if (key.leftArrow) {
        if (current?.hasChildren && expandedKeys.has(current.node.key)) {
          setExpandedKeys((prev) => {
            const next = new Set(prev);
            next.delete(current.node.key);
            return next;
          });
        }
      } else if (key.return && current && !current.node.disabled) {
        onSelect?.(current.node);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    setActiveIndex((index) =>
      Math.min(index, Math.max(0, flatNodes.length - 1))
    );
  }, [flatNodes.length]);

  return (
    <Box flexDirection="column" aria-role="list">
      <Text aria-label={ariaLabel}>{""}</Text>
      {flatNodes.map(({ node, depth, hasChildren }, idx) => {
        const isActive = idx === activeIndex;
        const isExpanded = expandedKeys.has(node.key);

        const prefix = "  ".repeat(depth);
        let indicator: string;
        if (hasChildren) {
          indicator = isExpanded ? resolvedExpandedIcon : resolvedCollapsedIcon;
        } else {
          indicator = node.icon ?? resolvedLeafIcon;
        }

        return (
          <Box
            key={node.key}
            flexDirection="row"
            aria-role="listitem"
            aria-label={`${node.label}, level ${depth + 1}${
              hasChildren ? `, ${isExpanded ? "expanded" : "collapsed"}` : ""
            }${isActive && isFocused ? ", current" : ""}`}
            aria-state={{
              disabled: node.disabled || undefined,
              expanded: hasChildren ? isExpanded : undefined,
              selected: isActive && isFocused,
            }}
          >
            <Text>{prefix}</Text>
            <Text
              color={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
            >
              {isActive && isFocused ? "[" : ""}
              {indicator}
              {isActive && isFocused ? "] " : " "}
            </Text>
            <Text
              bold={isActive}
              color={isActive ? theme.colors.primary : theme.colors.foreground}
            >
              {node.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
