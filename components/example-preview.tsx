"use client";

import { Box, Text } from "ink";
import { Component as ReactComponent, Suspense } from "react";

import { useTheme } from "@/components/ui/theme-provider";
import { ExamplesIndex } from "@/examples/__index__";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";

const InkPreviewPlaceholder = ({
  componentName,
  description,
}: {
  componentName: string;
  description: string;
}) => {
  const theme = useTheme();

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
}) => (
  <div className="flex min-h-72 items-center justify-center p-6 text-center text-sm text-muted-foreground">
    <div className="space-y-2">
      <div className="font-medium text-foreground">{componentName}</div>
      <div>{description}</div>
    </div>
  </div>
);

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
