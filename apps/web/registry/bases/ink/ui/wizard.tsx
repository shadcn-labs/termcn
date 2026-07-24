import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/ink-theme-provider";
import { useInput } from "@/hooks/use-input";

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

  useInput((input, key) => {
    if (key.escape) {
      onCancel?.();
      return;
    }

    const goNext = (key.tab && !key.shift) || key.rightArrow;
    const goBack = (key.tab && key.shift) || key.leftArrow;

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
    <Box flexDirection="column" gap={1}>
      {showProgress && (
        <Box flexDirection="row" alignItems="center">
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
              <Box key={step.key} flexDirection="row" alignItems="center">
                <Text color={iconColor} bold={isCurrent}>
                  {icon} {step.title}
                </Text>
                {index < steps.length - 1 && (
                  <Text color={theme.colors.mutedForeground}> ─── </Text>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      <Box flexDirection="column" gap={1}>
        {steps[currentStep]?.content}
      </Box>

      {validationError && (
        <Text color={theme.colors.error}>
          {"✗ "}
          {validationError}
        </Text>
      )}

      <Box flexDirection="row" gap={2}>
        {!isFirst && <Text color={theme.colors.mutedForeground}>[← Back]</Text>}
        {isLast ? (
          <Text color={theme.colors.primary} bold>
            [Finish]
          </Text>
        ) : (
          <Text color={theme.colors.primary} bold>
            [Next →]
          </Text>
        )}
      </Box>
    </Box>
  );
};
