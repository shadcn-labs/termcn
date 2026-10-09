"use client";

import { Box, Text } from "ink";
import { useIntlayer } from "next-intlayer";
import { Component as ReactComponent, Suspense } from "react";

import { ExamplesIndex } from "@/examples/__index__";
import { DEFAULT_BASE_NAME } from "@/registry/bases";
import type { BaseName } from "@/registry/bases";
import { useTheme as useInkTheme } from "@/registry/bases/ink/hooks/use-theme";
import { useTheme as useOpenTuiTheme } from "@/registry/bases/opentui/hooks/use-theme";

const InkPreviewPlaceholder = ({
  componentName,
  description,
}: {
  componentName: string;
  description: string;
}) => {
  const content = useIntlayer("example-preview");
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
        {String(content.inspectUsageSnippet)}
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

const PreviewFallback = ({
  componentName,
  message,
  base,
}: {
  componentName: string;
  message?: string;
  base: BaseName;
}) => {
  const content = useIntlayer("example-preview");

  return (
    <PreviewPlaceholder
      componentName={componentName}
      description={
        message
          ? String(content.livePreviewFallbackWithMessage({ message }))
          : String(content.livePreviewFallback)
      }
      base={base}
    />
  );
};

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
        <PreviewFallback
          componentName={this.props.componentName}
          message={this.state.message}
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
  const content = useIntlayer("example-preview");
  const example = ExamplesIndex[base]?.[name];
  if (!example) {
    return (
      <PreviewPlaceholder
        componentName={name}
        description={String(content.noLivePreviewRegistered({ base }))}
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
            description={String(content.loadingPreview)}
            base={base}
          />
        }
      >
        <ExampleComponent />
      </Suspense>
    </PreviewErrorBoundary>
  );
};
