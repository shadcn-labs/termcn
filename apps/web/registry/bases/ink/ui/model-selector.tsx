import { Box, Text } from "ink";
import React, { useState } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  context?: number;
}

export interface ModelSelectorProps {
  models: ModelOption[];
  selected: string;
  onSelect?: (id: string) => void;
  showContext?: boolean;
  showProvider?: boolean;
  groupByProvider?: boolean;
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
}: ModelRowProps) => (
  <Box gap={1}>
    <Text color={isActive ? theme.colors.primary : undefined}>
      {isActive ? "›" : " "}
    </Text>
    <Text
      bold={isActive || isSelected}
      color={getModelColor(isSelected, isActive, theme)}
    >
      {model.name}
    </Text>
    {isSelected && <Text color={theme.colors.success ?? "green"}>✓</Text>}
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
  selected,
  onSelect,
  showContext = true,
  showProvider = true,
  groupByProvider = false,
}: ModelSelectorProps) => {
  const theme = useTheme();
  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = models.findIndex((m) => m.id === selected);
    return Math.max(idx, 0);
  });

  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setActiveIndex((i) => Math.min(models.length - 1, i + 1));
    } else if (key.return) {
      const m = models[activeIndex];
      if (m) {
        onSelect?.(m.id);
      }
    }
  });

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
      <Box flexDirection="column">
        {Object.entries(providerGroups).map(([provider, group]) => (
          <Box key={provider} flexDirection="column">
            <Text bold color={theme.colors.primary}>
              {provider}
            </Text>
            {group.map((model) => {
              const globalIdx = models.indexOf(model);
              const isActive = globalIdx === activeIndex;
              const isSelected = model.id === selected;
              return (
                <ModelRow
                  key={model.id}
                  model={model}
                  isActive={isActive}
                  isSelected={isSelected}
                  showContext={showContext}
                  showProvider={false}
                  theme={theme}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {models.map((model, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = model.id === selected;
        return (
          <ModelRow
            key={model.id}
            model={model}
            isActive={isActive}
            isSelected={isSelected}
            showContext={showContext}
            showProvider={showProvider}
            theme={theme}
          />
        );
      })}
    </Box>
  );
};
