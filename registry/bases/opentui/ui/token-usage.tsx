/* @jsxImportSource @opentui/react */

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface TokenUsageProps {
  prompt: number;
  completion: number;
  model?: string;
  showCost?: boolean;
}

const MODEL_PRICING: Record<
  string,
  {
    input: number;
    output: number;
  }
> = {
  "claude-3-5-haiku": { input: 0.8, output: 4 },
  "claude-3-5-sonnet": { input: 3, output: 15 },
  "claude-3-opus": { input: 15, output: 75 },
  "gpt-4-turbo": { input: 10, output: 30 },
  "gpt-4o": { input: 5, output: 15 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
};

const formatTokens = (n: number): string => {
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
};

const estimateCost = (
  prompt: number,
  completion: number,
  model?: string
): number | null => {
  if (!model) {
    return null;
  }
  const key = Object.keys(MODEL_PRICING).find((k) =>
    model.toLowerCase().includes(k)
  );
  if (!key) {
    return null;
  }
  const pricing = MODEL_PRICING[key];
  return (
    (prompt / 1_000_000) * pricing.input +
    (completion / 1_000_000) * pricing.output
  );
};

export const TokenUsage = ({
  prompt,
  completion,
  model,
  showCost = false,
}: TokenUsageProps) => {
  const theme = useTheme();
  const cost = showCost ? estimateCost(prompt, completion, model) : null;

  return (
    <box gap={0}>
      <text fg={theme.colors.mutedForeground}>{"⟨ "}</text>
      <text fg={theme.colors.primary}>{formatTokens(prompt)}</text>
      <text fg={theme.colors.mutedForeground}>{" in / "}</text>
      <text fg={theme.colors.secondary ?? theme.colors.accent}>
        {formatTokens(completion)}
      </text>
      <text fg={theme.colors.mutedForeground}>{" out"}</text>
      {model && <text fg={theme.colors.mutedForeground}>{` · ${model}`}</text>}
      {cost !== null && (
        <text
          fg={theme.colors.mutedForeground}
        >{` · $${cost.toFixed(4)}`}</text>
      )}
      <text fg={theme.colors.mutedForeground}>{" ⟩"}</text>
    </box>
  );
};

export interface ContextMeterProps {
  used: number;
  limit: number;
  label?: string;
  showPercent?: boolean;
  warnAt?: number;
  criticalAt?: number;
  width?: number;
}

export const ContextMeter = ({
  used,
  limit,
  label,
  showPercent = true,
  warnAt = 75,
  criticalAt = 90,
  width = 20,
}: ContextMeterProps) => {
  const theme = useTheme();
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  let barColor: string;
  if (percent >= criticalAt) {
    barColor = theme.colors.error ?? "red";
  } else if (percent >= warnAt) {
    barColor = theme.colors.warning ?? "yellow";
  } else {
    barColor = theme.colors.success ?? "green";
  }

  const bar = "█".repeat(filled) + "░".repeat(empty);

  return (
    <box gap={1}>
      {label && <text fg={theme.colors.mutedForeground}>{label}</text>}
      <text fg={barColor}>{bar}</text>
      {showPercent && <text fg={barColor}>{`${percent}%`}</text>}
      <text
        fg={theme.colors.mutedForeground}
      >{`${formatTokens(used)}/${formatTokens(limit)}`}</text>
    </box>
  );
};
