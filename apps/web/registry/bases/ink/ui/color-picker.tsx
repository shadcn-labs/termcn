import { Box, Text } from "ink";
import React, { useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import { resolveBorderStyle } from "@/registry/bases/ink/lib/accessibility";

const DEFAULT_PALETTE = [
  "#000000",
  "#800000",
  "#008000",
  "#808000",
  "#000080",
  "#800080",
  "#008080",
  "#c0c0c0",
  "#808080",
  "#ff0000",
  "#00ff00",
  "#ffff00",
  "#0000ff",
  "#ff00ff",
  "#00ffff",
  "#ffffff",
];

const COLS = 8;

export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (color: string) => void;
  onChange?: (color: string) => void;
  onSubmit?: (color: string) => void;
  label?: string;
  palette?: string[];
  autoFocus?: boolean;
  id?: string;
  isActive?: boolean;
  disabled?: boolean;
  "aria-label"?: string;
}

export const ColorPicker = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  onSubmit,
  label,
  palette = DEFAULT_PALETTE,
  autoFocus = false,
  id,
  isActive = true,
  disabled = false,
  "aria-label": ariaLabel,
}: ColorPickerProps) => {
  const unicode = useUnicode();
  const theme = useTheme();
  const [paletteRow, setPaletteRow] = useState(0);
  const [paletteCol, setPaletteCol] = useState(0);
  const [hexInput, setHexInput] = useState("");
  const [mode, setMode] = useState<"palette" | "hex">("palette");
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? palette[0] ?? "#000000"
  );

  const rows = Math.ceil(palette.length / COLS);
  const currentPaletteColor =
    palette[paletteRow * COLS + paletteCol] ?? palette[0] ?? "#000000";
  const currentColor = controlledValue ?? internalValue;

  const applyColor = (color: string) => {
    const changeHandler = onValueChange ?? onChange;
    if (changeHandler) {
      changeHandler(color);
    } else {
      setInternalValue(color);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.pageUp || key.pageDown) {
        setMode((m) => (m === "palette" ? "hex" : "palette"));
        return;
      }

      if (mode === "palette") {
        if (key.upArrow) {
          setPaletteRow((r) => Math.max(0, r - 1));
        } else if (key.downArrow) {
          setPaletteRow((r) => Math.min(rows - 1, r + 1));
        } else if (key.leftArrow) {
          setPaletteCol((c) => Math.max(0, c - 1));
        } else if (key.rightArrow) {
          setPaletteCol((c) => Math.min(COLS - 1, c + 1));
        } else if (key.return) {
          applyColor(currentPaletteColor);
          onSubmit?.(currentPaletteColor);
        }
      } else if (key.backspace || key.delete) {
        setHexInput((h) => h.slice(0, -1));
      } else if (key.return) {
        const hex = hexInput.startsWith("#") ? hexInput : `#${hexInput}`;
        if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
          applyColor(hex);
          onSubmit?.(hex);
        }
      } else if (/^[0-9a-fA-F#]$/.test(input) && hexInput.length < 7) {
        setHexInput((h) => h + input);
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box flexDirection="column">
      {label && <Text bold>{label}</Text>}

      <Text aria-label={ariaLabel ?? label ?? "Color picker"}>{""}</Text>
      <Box aria-role="listbox" flexDirection="column">
        {Array.from({ length: rows }, (_, r) => (
          <Box key={r}>
            {Array.from({ length: COLS }, (_c, c) => {
              const idx = r * COLS + c;
              if (idx >= palette.length) {
                return null;
              }
              const paletteColor = palette[idx];
              const isActive =
                mode === "palette" && r === paletteRow && c === paletteCol;
              return (
                <Box
                  key={paletteColor}
                  aria-label={paletteColor}
                  aria-role="option"
                  aria-state={{
                    disabled,
                    selected: currentColor === paletteColor,
                  }}
                  marginRight={isActive ? 0 : 0}
                >
                  <Text
                    aria-hidden
                    backgroundColor={paletteColor}
                    color={isActive ? "#ffffff" : paletteColor}
                    bold={isFocused && isActive}
                  >
                    {isActive ? "[]" : "  "}
                  </Text>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box marginTop={1} gap={1}>
        <Text color={theme.colors.mutedForeground}>Selected:</Text>
        <Text backgroundColor={currentColor} color={currentColor}>
          {"  "}
        </Text>
        <Text color={theme.colors.foreground}>{currentColor}</Text>
      </Box>

      <Box
        aria-label={`Hex color input: ${hexInput || "empty"}`}
        aria-role="textbox"
        aria-state={{ disabled }}
        borderStyle={resolveBorderStyle("round", unicode)}
        borderColor={
          mode === "hex" ? theme.colors.focusRing : theme.colors.border
        }
        paddingX={1}
        marginTop={1}
      >
        <Text aria-hidden color={theme.colors.mutedForeground}>
          #
        </Text>
        <Text aria-hidden color={theme.colors.foreground}>
          {hexInput || "------"}
        </Text>
        {mode === "hex" && isFocused && (
          <Text aria-hidden color={theme.colors.focusRing}>
            {unicode ? "█" : "|"}
          </Text>
        )}
      </Box>

      <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
        {mode === "palette"
          ? unicode
            ? "↑↓←→: navigate · Enter: select · PageUp/PageDown: hex input"
            : "arrows: navigate - Enter: select - PageUp/PageDown: hex input"
          : unicode
            ? "Type hex · Enter: apply · PageUp/PageDown: palette"
            : "Type hex - Enter: apply - PageUp/PageDown: palette"}
      </Text>
    </Box>
  );
};
