import { Box, Text } from "ink";
import React, { useState } from "react";
import type { ReactNode } from "react";

import { isActivationKey, useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveStatusSymbol,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export interface WizardStep {
  key: string;
  title: string;
  content: ReactNode;
  validate?: () => boolean | string;
}

export interface WizardProps extends InteractionProps {
  steps: WizardStep[];
  onComplete?: (completedSteps: string[]) => void;
  onCancel?: () => void;
  showProgress?: boolean;
  "aria-label"?: string;
}

export const Wizard = ({
  steps,
  onComplete,
  onCancel,
  showProgress = true,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Wizard",
}: WizardProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isLast = currentStep === steps.length - 1;
  const isFirst = currentStep === 0;

  const goForward = () => {
    const step = steps[currentStep];
    if (step?.validate) {
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
      onComplete?.(steps.map((wizardStep) => wizardStep.key));
    } else {
      setCurrentStep((index) => index + 1);
    }
  };

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.escape) {
        onCancel?.();
        return;
      }

      const goNext = key.rightArrow || isActivationKey(input, key);
      const goBack = key.leftArrow;

      if (goNext) {
        goForward();
      } else if (goBack) {
        setValidationError(null);
        if (!isFirst) {
          setCurrentStep((i) => i - 1);
        }
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  return (
    <Box
      flexDirection="column"
      gap={1}
      aria-role="list"
      aria-state={{ disabled: disabled || undefined }}
    >
      <Text
        aria-label={`${ariaLabel}. Step ${currentStep + 1} of ${steps.length}: ${steps[currentStep]?.title ?? "Unknown"}.`}
      >
        {""}
      </Text>
      {showProgress && (
        <Box flexDirection="row" alignItems="center">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;

            let icon: string;
            let iconColor: string;
            if (isCompleted) {
              icon = resolveTerminalSymbol(unicode, "●", "[x]");
              iconColor = theme.colors.success;
            } else if (isCurrent) {
              icon = resolveTerminalSymbol(unicode, "◉", "[*]");
              iconColor = theme.colors.primary;
            } else {
              icon = resolveTerminalSymbol(unicode, "○", "[ ]");
              iconColor = theme.colors.mutedForeground;
            }

            return (
              <Box
                key={step.key}
                flexDirection="row"
                alignItems="center"
                aria-role="listitem"
                aria-label={`${step.title}, ${isCompleted ? "completed" : isCurrent ? "current" : "upcoming"}`}
              >
                <Text color={iconColor} bold={isCurrent}>
                  {icon} {step.title}
                </Text>
                {index < steps.length - 1 && (
                  <Text color={theme.colors.mutedForeground}>
                    {unicode ? " ─── " : " --- "}
                  </Text>
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
        <Text
          color={theme.colors.error}
          aria-label={`Error: ${validationError}`}
        >
          <Text aria-hidden>{resolveStatusSymbol(unicode, "error")} </Text>
          {validationError}
        </Text>
      )}

      <Box flexDirection="row" gap={2} aria-role="toolbar">
        {!isFirst && (
          <Box aria-role="button" aria-label="Back">
            <Text color={theme.colors.mutedForeground}>
              [{resolveTerminalSymbol(unicode, "←", "<-")} Back]
            </Text>
          </Box>
        )}
        {isLast ? (
          <Box aria-role="button" aria-label="Finish">
            <Text color={theme.colors.primary} bold inverse={isFocused}>
              [Finish]
            </Text>
          </Box>
        ) : (
          <Box aria-role="button" aria-label="Next">
            <Text color={theme.colors.primary} bold inverse={isFocused}>
              [Next {resolveTerminalSymbol(unicode, "→", "->")}]
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};
