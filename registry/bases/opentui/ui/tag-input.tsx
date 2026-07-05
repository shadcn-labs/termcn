/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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

  useKeyboard((key) => {
    if (key.name === "return") {
      addTag();
    } else if (key.name === "backspace" || key.name === "delete") {
      if (inputText.length > 0) {
        setInputText((t) => t.slice(0, -1));
      } else {
        removeLastTag();
      }
    } else if (key.name.length === 1 && !key.ctrl && !key.meta) {
      setInputText((t) => t + key.name);
    }
  });

  const atMax = maxTags !== undefined && tags.length >= maxTags;

  return (
    <box flexDirection="column" gap={1}>
      <box flexWrap="wrap" gap={1}>
        {tags.map((tag, idx) => (
          <box key={idx}>
            <text>
              <b>[</b>
            </text>
            <text>{tag}</text>
            <text>
              <b>{" ×]"}</b>
            </text>
          </box>
        ))}
      </box>
      <box gap={1}>
        <text fg={theme.colors.primary}>›</text>
        {atMax ? (
          <text fg="#666">{`Max ${maxTags} tag${maxTags === 1 ? "" : "s"} reached`}</text>
        ) : (
          <text
            fg={
              inputText ? theme.colors.foreground : theme.colors.mutedForeground
            }
          >
            {inputText || placeholder}
          </text>
        )}
      </box>
    </box>
  );
};
