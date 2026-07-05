/* @jsxImportSource @opentui/react */
import React, { Component } from "react";
import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (
    error: Error,
    info: {
      componentStack: string;
    }
  ) => void;
  title?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  componentStack: string;
}

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
    this.props.onError?.(error, {
      componentStack: info.componentStack ?? "",
    });
  }
  render() {
    const { hasError, error, componentStack } = this.state;
    const { children, fallback, title = "Error" } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const message = error?.message ?? "An unknown error occurred";
      const stackLines = componentStack
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 6);
      return (
        <box
          flexDirection="column"
          borderStyle="rounded"
          borderColor="red"
          paddingLeft={1}
          paddingRight={1}
          paddingTop={0}
          paddingBottom={0}
          gap={0}
        >
          <text fg="red">
            <b>{`✖ ${title}`}</b>
          </text>
          <box marginTop={1}>
            <text fg="white">
              <b>{message}</b>
            </text>
          </box>
          {stackLines.length > 0 && (
            <box flexDirection="column" marginTop={1}>
              <text fg="#666">Stack trace:</text>
              {stackLines.map((line, idx) => (
                <text key={idx} fg="#666">
                  {line}
                </text>
              ))}
            </box>
          )}
          <box marginTop={1}>
            <text fg="#666">
              The application encountered an unexpected error.
            </text>
          </box>
        </box>
      );
    }

    return children;
  }
}
