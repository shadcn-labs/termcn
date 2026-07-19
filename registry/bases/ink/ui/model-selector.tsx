import { Box, Text } from "ink";
import React, { useEffect, useState } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveStatusSymbol,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  context?: number;
  disabled?: boolean;
}

export interface ModelSelectorProps extends InteractionProps {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  selected?: string;
  onValueChange?: (id: string) => void;
  onSelect?: (id: string) => void;
  showContext?: boolean;
  showProvider?: boolean;
  groupByProvider?: boolean;
  "aria-label"?: string;
}

const formatContext = (ctx: number): string => {
  if (ctx >= 1_000_000) {
    return `${(ctx / 1_000_000).toFixed(0)}M ctx`;
  }
  if (ctx >= 1000) {
    return `${(ctx / 1000).toFixed(0)}k ctx`;
  }
  return `${ctx} ctx`;
};

interface ModelRowProps {
  model: ModelOption;
  isActive: boolean;
  isSelected: boolean;
  showContext: boolean;
  showProvider: boolean;
  theme: ReturnType<typeof useTheme>;
  controlFocused: boolean;
  unicode: boolean;
}

const getModelColor = (
  isSelected: boolean,
  isActive: boolean,
  theme: ReturnType<typeof useTheme>
): string => {
  if (isSelected) {
    return theme.colors.success ?? "green";
  }
  if (isActive) {
    return theme.colors.primary;
  }
  return theme.colors.foreground;
};

const ModelRow = ({
  model,
  isActive,
  isSelected,
  showContext,
  showProvider,
  theme,
  controlFocused,
  unicode,
}: ModelRowProps) => (
  <Box
    gap={1}
    aria-role="option"
    aria-label={`${model.name}, ${model.provider}${model.context === undefined ? "" : `, ${formatContext(model.context)}`}`}
    aria-state={{ disabled: model.disabled || undefined, selected: isSelected }}
  >
    <Text color={isActive ? theme.colors.primary : undefined}>
      {isActive && controlFocused
        ? `[${resolveTerminalSymbol(unicode, "›", ">")}]`
        : " "}
    </Text>
    <Text
      bold={isActive || isSelected}
      color={getModelColor(isSelected, isActive, theme)}
    >
      {model.name}
    </Text>
    {isSelected && (
      <Text color={theme.colors.success ?? "green"}>
        {resolveStatusSymbol(unicode, "success")}
      </Text>
    )}
    {showProvider && (
      <Text dimColor color={theme.colors.mutedForeground}>
        {model.provider}
      </Text>
    )}
    {showContext && model.context !== undefined && (
      <Text dimColor color={theme.colors.mutedForeground}>
        {formatContext(model.context)}
      </Text>
    )}
  </Box>
);

export const ModelSelector = ({
  models,
  value,
  defaultValue,
  selected,
  onValueChange,
  onSelect,
  showContext = true,
  showProvider = true,
  groupByProvider = false,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Model selector",
}: ModelSelectorProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [internalValue, setInternalValue] = useState(
    defaultValue ?? selected ?? models[0]?.id ?? ""
  );
  const selectedId = value ?? selected ?? internalValue;
  const [activeId, setActiveId] = useState(selectedId || models[0]?.id || "");
  const activeIndex = Math.max(
    0,
    models.findIndex((model) => model.id === activeId)
  );

  const commit = (nextValue: string) => {
    if (value === undefined && selected === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
    onSelect?.(nextValue);
  };

  const enabledModels = models.filter((model) => !model.disabled);
  const { isFocused } = useInteraction(
    (_input, key) => {
      const enabledIndex = enabledModels.findIndex(
        (model) => model.id === activeId
      );
      if (key.upArrow) {
        setActiveId(enabledModels[Math.max(0, enabledIndex - 1)]?.id ?? "");
      } else if (key.downArrow) {
        setActiveId(
          enabledModels[Math.min(enabledModels.length - 1, enabledIndex + 1)]
            ?.id ?? ""
        );
      } else if (key.home) {
        setActiveId(enabledModels[0]?.id ?? "");
      } else if (key.end) {
        setActiveId(enabledModels.at(-1)?.id ?? "");
      } else if (key.return) {
        const model = models.find((item) => item.id === activeId);
        if (model && !model.disabled) {
          commit(model.id);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  useEffect(() => {
    if (!models.some((model) => model.id === activeId && !model.disabled)) {
      setActiveId(enabledModels[0]?.id ?? "");
    }
  }, [activeId, enabledModels, models]);

  if (groupByProvider) {
    const providerGroups: Record<string, ModelOption[]> = {
      /* noop */
    };
    for (const m of models) {
      if (!providerGroups[m.provider]) {
        providerGroups[m.provider] = [];
      }
      providerGroups[m.provider]?.push(m);
    }

    return (
      <Box
        flexDirection="column"
        aria-role="listbox"
        aria-state={{ disabled: disabled || undefined }}
      >
        <Text aria-label={ariaLabel}>{""}</Text>
        {Object.entries(providerGroups).map(([provider, group]) => (
          <Box key={provider} flexDirection="column">
            <Text bold color={theme.colors.primary}>
              {provider}
            </Text>
            {group.map((model) => {
              const globalIdx = models.indexOf(model);
              const isActive = globalIdx === activeIndex;
              const isSelected = model.id === selectedId;
              return (
                <ModelRow
                  key={model.id}
                  model={model}
                  isActive={isActive}
                  isSelected={isSelected}
                  showContext={showContext}
                  showProvider={false}
                  theme={theme}
                  controlFocused={isFocused}
                  unicode={unicode}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      aria-role="listbox"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text aria-label={ariaLabel}>{""}</Text>
      {models.map((model, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = model.id === selectedId;
        return (
          <ModelRow
            key={model.id}
            model={model}
            isActive={isActive}
            isSelected={isSelected}
            showContext={showContext}
            showProvider={showProvider}
            theme={theme}
            controlFocused={isFocused}
            unicode={unicode}
          />
        );
      })}
    </Box>
  );
};
