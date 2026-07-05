/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState, useMemo } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
  icon?: string;
}

export interface TreeProps {
  nodes: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  defaultExpanded?: string[];
  expandedIcon?: string;
  collapsedIcon?: string;
  leafIcon?: string;
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
  expandedIcon = "▼",
  collapsedIcon = "▶",
  leafIcon = "•",
}: TreeProps) => {
  const theme = useTheme();
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(defaultExpanded)
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const flatNodes = useMemo(
    () => flattenTree(nodes, expandedKeys),
    [nodes, expandedKeys]
  );

  useKeyboard((key) => {
    const current = flatNodes[activeIndex];
    if (key.name === "up") {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setActiveIndex((i) => Math.min(flatNodes.length - 1, i + 1));
    } else if (key.name === "right" || key.name === "space") {
      if (current?.hasChildren && !expandedKeys.has(current.node.key)) {
        setExpandedKeys((prev) => new Set([...prev, current.node.key]));
      }
    } else if (key.name === "left") {
      if (current?.hasChildren && expandedKeys.has(current.node.key)) {
        setExpandedKeys((prev) => {
          const next = new Set(prev);
          next.delete(current.node.key);
          return next;
        });
      }
    } else if (key.name === "return" && current) {
      onSelect?.(current.node);
    }
  });

  return (
    <box flexDirection="column">
      {flatNodes.map(({ node, depth, hasChildren }, idx) => {
        const isActive = idx === activeIndex;
        const isExpanded = expandedKeys.has(node.key);
        const prefix = "  ".repeat(depth);
        let indicator: string;
        if (hasChildren) {
          indicator = isExpanded ? expandedIcon : collapsedIcon;
        } else {
          indicator = node.icon ?? leafIcon;
        }
        return (
          <box key={node.key} flexDirection="row">
            <text>{prefix}</text>
            <text
              fg={
                isActive ? theme.colors.primary : theme.colors.mutedForeground
              }
            >{`${indicator} `}</text>
            <text
              fg={isActive ? theme.colors.primary : theme.colors.foreground}
            >
              {isActive ? <b>{node.label}</b> : node.label}
            </text>
          </box>
        );
      })}
    </box>
  );
};
