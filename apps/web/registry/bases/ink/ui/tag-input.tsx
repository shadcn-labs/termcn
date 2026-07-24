import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface TagInputProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  delimiter?: string;
}

export const TagInput = ({
  value: controlledValue,
  onChange,
  placeholder = "Type and press Enter…",
  maxTags,
}: TagInputProps) => {
  const theme = useTheme();
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");

  const tags = controlledValue ?? internalTags;

  const updateTags = (next: string[]) => {
    if (controlledValue === undefined) {
      setInternalTags(next);
    }
    onChange?.(next);
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

  useInput((input, key) => {
    if (key.return) {
      addTag();
    } else if (key.backspace || key.delete) {
      if (inputText.length > 0) {
        setInputText((t) => t.slice(0, -1));
      } else {
        removeLastTag();
      }
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
  });

  const atMax = maxTags !== undefined && tags.length >= maxTags;

  return (
    <Box flexDirection="column" gap={1}>
      <Box flexWrap="wrap" gap={1}>
        {tags.map((tag, idx) => (
          <Box key={idx}>
            <Text bold>[</Text>
            <Text>{tag}</Text>
            <Text bold> ×]</Text>
          </Box>
        ))}
      </Box>
      <Box gap={1}>
        <Text color={theme.colors.primary}>›</Text>
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
            {inputText || placeholder}
          </Text>
        )}
      </Box>
    </Box>
  );
};
