import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveTerminalSymbol } from "@/registry/bases/ink/lib/accessibility";
import {
  graphemeLength,
  removeGraphemeBefore,
} from "@/registry/bases/ink/lib/terminal-text";

export interface TagInputProps {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (tags: string[]) => void;
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  delimiter?: string;
  label?: string;
  id?: string;
  autoFocus?: boolean;
  isActive?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  "aria-label"?: string;
}

export const TagInput = ({
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  onChange,
  placeholder,
  maxTags,
  delimiter = ",",
  label,
  id,
  autoFocus = false,
  isActive = true,
  disabled = false,
  readOnly = false,
  required = false,
  "aria-label": ariaLabel,
}: TagInputProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedPlaceholder =
    placeholder ??
    resolveTerminalSymbol(
      unicode,
      "Type and press Enter…",
      "Type and press Enter..."
    );
  const [internalTags, setInternalTags] = useState<string[]>(defaultValue);
  const [inputText, setInputText] = useState("");

  const tags = controlledValue ?? internalTags;

  const updateTags = (next: string[]) => {
    if (controlledValue === undefined) {
      setInternalTags(next);
    }
    (onValueChange ?? onChange)?.(next);
  };

  const addTag = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      return;
    }
    if (maxTags !== undefined && tags.length >= maxTags) {
      return;
    }
    updateTags([...tags, trimmed]);
    setInputText("");
  };

  const removeLastTag = () => {
    if (tags.length === 0) {
      return;
    }
    updateTags(tags.slice(0, -1));
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (readOnly) {
        return;
      }
      if (key.return) {
        addTag();
      } else if (key.backspace) {
        if (graphemeLength(inputText) > 0) {
          setInputText(
            (current) =>
              removeGraphemeBefore(current, graphemeLength(current)).value
          );
        } else {
          removeLastTag();
        }
      } else if (input === delimiter) {
        addTag();
      } else if (
        input &&
        !key.ctrl &&
        !key.meta &&
        !key.upArrow &&
        !key.downArrow &&
        !key.leftArrow &&
        !key.rightArrow &&
        !key.escape &&
        !key.tab
      ) {
        setInputText((t) => t + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const atMax = maxTags !== undefined && tags.length >= maxTags;

  return (
    <Box flexDirection="column" gap={1}>
      <Text
        aria-label={ariaLabel ?? label ?? "Tag input"}
        bold={Boolean(label)}
      >
        {label ?? ""}
      </Text>
      <Box aria-role="list" flexWrap="wrap" gap={1}>
        {tags.map((tag, idx) => (
          <Box key={`${tag}-${idx}`} aria-label={tag} aria-role="listitem">
            <Text aria-hidden bold>
              [
            </Text>
            <Text>{tag}</Text>
            <Text aria-hidden bold>
              {" "}
              {resolveTerminalSymbol(unicode, "×]", "x]")}
            </Text>
          </Box>
        ))}
      </Box>
      <Box
        aria-label={`${ariaLabel ?? label ?? "Tag input"}: ${inputText || "empty"}. ${tags.length} tags`}
        aria-role="textbox"
        aria-state={{ disabled, readonly: readOnly, required }}
        gap={1}
      >
        <Text aria-hidden color={theme.colors.primary}>
          {isFocused ? ">" : " "}
        </Text>
        {atMax ? (
          <Text color={theme.colors.mutedForeground} dimColor>
            {`Max ${maxTags} tag${maxTags === 1 ? "" : "s"} reached`}
          </Text>
        ) : (
          <Text
            color={
              inputText ? theme.colors.foreground : theme.colors.mutedForeground
            }
          >
            {inputText || resolvedPlaceholder}
          </Text>
        )}
      </Box>
    </Box>
  );
};
