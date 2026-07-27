"use client";

import { Box, Text } from "ink";
import { Component as ReactComponent, Suspense } from "react";

import { useTheme as useOpenTuiTheme } from "@/components/ui/opentui-theme-provider";
import { ExamplesIndex } from "@/examples/__index__";
import { useTheme as useInkTheme } from "@/hooks/use-theme";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

const InkPreviewPlaceholder = ({
  componentName,
  description,
}: {
  componentName: string;
  description: string;
}) => {
  const theme = useInkTheme();

  return (
    <Box
      borderColor={theme.colors.border}
      borderStyle="round"
      flexDirection="column"
      paddingX={1}
    >
      <Text bold color={theme.colors.primary}>
        {componentName}
      </Text>
      <Text color={theme.colors.foreground}>{description}</Text>
      <Text color={theme.colors.mutedForeground} dimColor>
        Inspect the usage snippet below for install details and example props.
      </Text>
    </Box>
  );
};

const OpenTuiPreviewPlaceholder = ({
  componentName,
  description,
}: {
  componentName: string;
  description: string;
}) => {
  const theme = useOpenTuiTheme();

  return (
    <box flexDirection="column" padding={1}>
      <text fg={theme.colors.primary}>
        <b>{componentName}</b>
      </text>
      <text fg={theme.colors.foreground}>{description}</text>
    </box>
  );
};

const PreviewPlaceholder = ({
  componentName,
  description,
  base,
}: {
  componentName: string;
  description: string;
  base: BaseName;
}) =>
  base === DEFAULT_BASE_NAME ? (
    <InkPreviewPlaceholder
      componentName={componentName}
      description={description}
    />
  ) : (
    <OpenTuiPreviewPlaceholder
      componentName={componentName}
      description={description}
    />
  );

class PreviewErrorBoundary extends ReactComponent<
  {
    children: React.ReactNode;
    componentName: string;
    base: BaseName;
  },
  { hasError: boolean; message?: string }
> {
  public constructor(props: {
    children: React.ReactNode;
    componentName: string;
    base: BaseName;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <PreviewPlaceholder
          componentName={this.props.componentName}
          description={
            this.state.message
              ? `Live preview fallback: ${this.state.message}`
              : "Live preview fallback."
          }
          base={this.props.base}
        />
      );
    }

    return this.props.children;
  }
}

export const ExamplePreview = ({
  base = DEFAULT_BASE_NAME,
  name,
}: {
  base?: BaseName;
  name: string;
}) => {
  const example = ExamplesIndex[base]?.[name];
  if (!example) {
    return (
      <PreviewPlaceholder
        componentName={name}
        description={`No ${base} live preview is registered for this example yet.`}
        base={base}
      />
    );
  }

  const ExampleComponent = example.component;

  return (
    <PreviewErrorBoundary componentName={name} base={base}>
      <Suspense
        fallback={
          <PreviewPlaceholder
            componentName={name}
            description="Loading preview..."
            base={base}
          />
        }
      >
        <ExampleComponent />
      </Suspense>
    </PreviewErrorBoundary>
  );
};
