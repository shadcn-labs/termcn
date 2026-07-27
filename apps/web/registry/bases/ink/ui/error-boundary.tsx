import { Box, Text } from "ink";
import React, { Component } from "react";
import type { ReactNode } from "react";

import { useUnicode } from "@/hooks/use-unicode";
import {
  resolveBorderStyle,
  resolveTerminalSymbol,
} from "@/registry/bases/ink/lib/accessibility";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: { componentStack: string }) => void;
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

const DefaultErrorFallback = ({
  componentStack,
  message,
  title,
}: {
  componentStack: string;
  message: string;
  title: string;
}) => {
  const unicode = useUnicode();
  const stackLines = componentStack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <Box
      flexDirection="column"
      borderStyle={resolveBorderStyle("round", unicode)}
      borderColor="red"
      paddingX={1}
      paddingY={0}
      gap={0}
    >
      <Text color="red" bold>
        <Text aria-hidden>{resolveTerminalSymbol(unicode, "✖ ", "x ")}</Text>
        {title}
      </Text>
      <Text aria-label={`Error: ${title}. ${message}`}>{""}</Text>
      <Box marginTop={1}>
        <Text color="white" bold>
          {message}
        </Text>
      </Box>
      {stackLines.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          <Text color="red" dimColor>
            Stack trace:
          </Text>
          {stackLines.map((line, index) => (
            <Text key={index} color="red" dimColor>
              {line}
            </Text>
          ))}
        </Box>
      )}
      <Box marginTop={1}>
        <Text color="red" dimColor>
          The application encountered an unexpected error.
        </Text>
      </Box>
    </Box>
  );
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { componentStack: "", error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? "" });
    this.props.onError?.(error, { componentStack: info.componentStack ?? "" });
  }

  render() {
    const { hasError, error, componentStack } = this.state;
    const { children, fallback, title = "Error" } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const message = error?.message ?? "An unknown error occurred";
      return (
        <DefaultErrorFallback
          componentStack={componentStack}
          message={message}
          title={title}
        />
      );
    }

    return children;
  }
}
