/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

export interface WizardStep {
  key: string;
  title: string;
  content: ReactNode;
  validate?: () => boolean | string;
}

export interface WizardProps {
  steps: WizardStep[];
  onComplete?: (completedSteps: string[]) => void;
  onCancel?: () => void;
  showProgress?: boolean;
}

export const Wizard = ({
  steps,
  onComplete,
  onCancel,
  showProgress = true,
}: WizardProps) => {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  useKeyboard((key) => {
    if (key.name === "escape") {
      onCancel?.();
      return;
    }

    const goNext = (key.name === "tab" && !key.shift) || key.name === "right";
    const goBack = (key.name === "tab" && key.shift) || key.name === "left";
    if (goNext) {
      const step = steps[currentStep];
      if (step.validate) {
        const result = step.validate();
        if (result !== true) {
          setValidationError(
            typeof result === "string" ? result : "Validation failed"
          );
          return;
        }
      }
      setValidationError(null);
      if (isLast) {
        onComplete?.(steps.map((s) => s.key));
      } else {
        setCurrentStep((i) => i + 1);
      }
    } else if (goBack) {
      setValidationError(null);
      if (!isFirst) {
        setCurrentStep((i) => i - 1);
      }
    }
  });

  return (
    <box flexDirection="column" gap={1}>
      {showProgress && (
        <box flexDirection="row" alignItems="center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            let icon: string;
            let iconColor: string;
            if (isCompleted) {
              icon = "●";
              iconColor = theme.colors.success;
            } else if (isCurrent) {
              icon = "◉";
              iconColor = theme.colors.primary;
            } else {
              icon = "○";
              iconColor = theme.colors.mutedForeground;
            }

            return (
              <box key={step.key} flexDirection="row" alignItems="center">
                <text fg={iconColor}>
                  {isCurrent ? (
                    <b>{`${icon} ${step.title}`}</b>
                  ) : (
                    `${icon} ${step.title}`
                  )}
                </text>
                {index < steps.length - 1 && (
                  <text fg={theme.colors.mutedForeground}>{" ─── "}</text>
                )}
              </box>
            );
          })}
        </box>
      )}

      <box flexDirection="column" gap={1}>
        {steps[currentStep]?.content}
      </box>

      {validationError && (
        <text fg={theme.colors.error}>{`✗ ${validationError}`}</text>
      )}

      <box flexDirection="row" gap={2}>
        {!isFirst && <text fg={theme.colors.mutedForeground}>[← Back]</text>}
        {isLast ? (
          <text fg={theme.colors.primary}>
            <b>[Finish]</b>
          </text>
        ) : (
          <text fg={theme.colors.primary}>
            <b>[Next →]</b>
          </text>
        )}
      </box>
    </box>
  );
};
