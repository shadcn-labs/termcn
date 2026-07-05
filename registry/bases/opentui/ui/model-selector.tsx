/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import type { Key } from "react";
import { useState } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

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
  key?: Key | null;
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
  <box gap={1}>
    <text fg={isActive ? theme.colors.primary : undefined}>
      {isActive ? "›" : " "}
    </text>
    <text fg={getModelColor(isSelected, isActive, theme)}>
      {isActive || isSelected ? <b>{model.name}</b> : model.name}
    </text>
    {isSelected && <text fg={theme.colors.success ?? "green"}>✓</text>}
    {showProvider && (
      <text fg={theme.colors.mutedForeground}>{model.provider}</text>
    )}
    {showContext && model.context !== undefined && (
      <text fg={theme.colors.mutedForeground}>
        {formatContext(model.context)}
      </text>
    )}
  </box>
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

  useKeyboard((key) => {
    if (key.name === "up") {
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (key.name === "down") {
      setActiveIndex((i) => Math.min(models.length - 1, i + 1));
    } else if (key.name === "return") {
      const m = models[activeIndex];
      if (m) {
        onSelect?.(m.id);
      }
    }
  });

  if (groupByProvider) {
    const providerGroups: Record<string, ModelOption[]> = {};
    for (const m of models) {
      if (!providerGroups[m.provider]) {
        providerGroups[m.provider] = [];
      }
      providerGroups[m.provider]?.push(m);
    }

    return (
      <box flexDirection="column">
        {Object.entries(providerGroups).map(([provider, group]) => (
          <box key={provider} flexDirection="column">
            <text fg={theme.colors.primary}>
              <b>{provider}</b>
            </text>
            {group.map((model) => {
              const globalIdx = models.indexOf(model);
              const isActive = globalIdx === activeIndex;
              const isSelected = model.id === selected;
              return (
                <ModelRow
                  key={model.id}
                  isActive={isActive}
                  isSelected={isSelected}
                  model={model}
                  showContext={showContext}
                  showProvider={false}
                  theme={theme}
                />
              );
            })}
          </box>
        ))}
      </box>
    );
  }

  return (
    <box flexDirection="column">
      {models.map((model, idx) => {
        const isActive = idx === activeIndex;
        const isSelected = model.id === selected;
        return (
          <ModelRow
            key={model.id}
            isActive={isActive}
            isSelected={isSelected}
            model={model}
            showContext={showContext}
            showProvider={showProvider}
            theme={theme}
          />
        );
      })}
    </box>
  );
};
