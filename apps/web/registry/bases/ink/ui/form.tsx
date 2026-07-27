import { useFocusManager, Box, Text } from "ink";
import {
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";

import { useInteraction } from "@/hooks/use-interaction";
import type { InteractionProps } from "@/hooks/use-interaction";
import { useTheme } from "@/hooks/use-theme";

interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextValue>({
  errors: {
    /* noop */
  },
  isDirty: false,
  setFieldError: () => {
    /* noop */
  },
  setFieldValue: () => {
    /* noop */
  },
  values: {
    /* noop */
  },
});

export const useFormContext = () => useContext(FormContext);

export interface FormField {
  name: string;
  validate?: (value: unknown) => string | null;
}

export interface FormProps extends InteractionProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  fields?: FormField[];
  children: ReactNode;
  onCancel?: () => void;
  "aria-label"?: string;
}

export const Form = ({
  onSubmit,
  initialValues = {
    /* noop */
  },
  fields = [],
  children,
  onCancel,
  id,
  autoFocus,
  isActive,
  disabled,
  "aria-label": ariaLabel = "Form",
}: FormProps) => {
  const theme = useTheme();
  const { focus } = useFocusManager();
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({
    /* noop */
  });
  const [isDirty, setIsDirty] = useState(false);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((e) => ({ ...e, [name]: error }));
  }, []);

  const validateAndSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const error = field.validate?.(values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    }
    setErrors(newErrors);
    const firstInvalidField = fields.find((field) => newErrors[field.name]);
    if (firstInvalidField) {
      focus(firstInvalidField.name);
      return;
    }
    onSubmit?.(values);
  }, [fields, focus, onSubmit, values]);

  const { isFocused } = useInteraction(
    (input, key) => {
      if (key.ctrl && input === "s") {
        validateAndSubmit();
      } else if (key.escape) {
        onCancel?.();
      }
    },
    { autoFocus, disabled, id, isActive }
  );

  const contextValue = useMemo(
    () => ({ errors, isDirty, setFieldError, setFieldValue, values }),
    [errors, isDirty, setFieldError, setFieldValue, values]
  );

  return (
    <FormContext.Provider value={contextValue}>
      <Box
        flexDirection="column"
        gap={1}
        aria-role="list"
        aria-state={{ disabled: disabled || undefined }}
      >
        <Text aria-label={`${ariaLabel}.${isFocused ? " Focused." : ""}`}>
          {""}
        </Text>
        {Object.keys(errors).length > 0 && (
          <Box aria-role="listitem">
            <Text
              aria-label={`Form errors: ${Object.entries(errors)
                .map(([name, error]) => `${name}: ${error}`)
                .join(". ")}`}
            >
              {`Errors: ${Object.keys(errors).length}`}
            </Text>
          </Box>
        )}
        {children}
        <Text aria-hidden color={theme.colors.mutedForeground} dimColor>
          Press Ctrl+S to submit
        </Text>
      </Box>
    </FormContext.Provider>
  );
};
