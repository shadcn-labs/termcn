/* @jsxImportSource @opentui/react */
import { useKeyboard } from "@opentui/react";
import {
  createElement,
  useState,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from "react";
import type { ReactNode } from "react";

import { useTheme } from "@/components/ui/opentui-theme-provider";

interface FormContextValue {
  values: Record<string, unknown>;
  errors: Record<string, string>;
  isDirty: boolean;
  setFieldValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string) => void;
}

const FormContext = createContext<FormContextValue>({
  errors: {},
  isDirty: false,
  setFieldError: () => {
    /* noop */
  },
  setFieldValue: () => {
    /* noop */
  },
  values: {},
});

export const useFormContext = () => useContext(FormContext);

export interface FormField {
  name: string;
  validate?: (value: unknown) => string | null;
}

export interface FormProps {
  onSubmit?: (values: Record<string, unknown>) => void;
  initialValues?: Record<string, unknown>;
  fields?: FormField[];
  children: ReactNode;
}

export const Form = ({
  onSubmit,
  initialValues = {},
  fields = [],
  children,
}: FormProps) => {
  const theme = useTheme();
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const setFieldValue = useCallback((name: string, value: unknown) => {
    setValues((v) => ({ ...v, [name]: value }));
    setIsDirty(true);
  }, []);

  const setFieldError = useCallback((name: string, error: string) => {
    setErrors((e) => ({ ...e, [name]: error }));
  }, []);

  useKeyboard((key) => {
    if (key.ctrl && key.name === "s") {
      const newErrors: Record<string, string> = {};
      for (const field of fields) {
        const err = field.validate ? field.validate(values[field.name]) : null;
        if (err) {
          newErrors[field.name] = err;
        }
      }
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      onSubmit?.(values);
    }
  });

  const contextValue = useMemo(
    () => ({ errors, isDirty, setFieldError, setFieldValue, values }),
    [errors, isDirty, setFieldError, setFieldValue, values]
  );

  return createElement(
    FormContext.Provider,
    { value: contextValue },
    <box flexDirection="column" gap={1}>
      {children}
      <text fg="#666">Press Ctrl+S to submit</text>
    </box>
  );
};
