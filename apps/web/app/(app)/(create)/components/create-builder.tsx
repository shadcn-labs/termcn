"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEFAULT_PROJECT_CONFIG,
  FRAMEWORKS,
  TEMPLATES,
  THEMES,
} from "@/lib/create-config";
import type {
  FrameworkName,
  ProjectConfig,
  TemplateName,
  ThemeName,
} from "@/lib/create-config";
import { OPEN_CREATE_CODE_DIALOG_EVENT } from "@/lib/create-events";

import { CreateCustomizer } from "./create-customizer";
import { ResizableTerminalWindow } from "./resizable-terminal-window";
import { WelcomeDialog } from "./welcome-dialog";

type ConfigField = keyof ProjectConfig;

const TEMPLATE_PREVIEWS: Record<TemplateName, string> = {
  "app-shell": "app-shell-demo",
  blank: "welcome-screen-demo",
  "help-screen": "help-screen-demo",
  "login-flow": "login-flow-demo",
  "setup-flow": "setup-flow-demo",
  "splash-screen": "splash-screen-demo",
  "usage-monitor": "usage-monitor-demo",
  "welcome-screen": "welcome-screen-demo",
};

const getConfigFromSearchParams = (
  searchParams: Pick<URLSearchParams, "get">
): ProjectConfig => {
  const framework = searchParams.get("framework");
  const theme = searchParams.get("theme");
  const template = searchParams.get("template");

  return {
    framework: FRAMEWORKS.some((entry) => entry.name === framework)
      ? (framework as FrameworkName)
      : DEFAULT_PROJECT_CONFIG.framework,
    template: TEMPLATES.some((entry) => entry.name === template)
      ? (template as TemplateName)
      : DEFAULT_PROJECT_CONFIG.template,
    theme: THEMES.some((entry) => entry.name === theme)
      ? (theme as ThemeName)
      : DEFAULT_PROJECT_CONFIG.theme,
  };
};

const serializeConfig = (config: ProjectConfig) => {
  const params = new URLSearchParams();
  params.set("framework", config.framework);
  params.set("theme", config.theme);
  params.set("template", config.template);
  return params;
};

export const CreateBuilder = () => {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<ProjectConfig>(() =>
    getConfigFromSearchParams(searchParams)
  );
  const configRef = useRef(config);
  const [lockedFields, setLockedFields] = useState<Set<ConfigField>>(
    () => new Set()
  );
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const next = getConfigFromSearchParams(
        new URLSearchParams(location.search)
      );
      configRef.current = next;
      setConfig(next);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const openProjectDialog = () => setProjectDialogOpen(true);
    window.addEventListener(OPEN_CREATE_CODE_DIALOG_EVENT, openProjectDialog);
    return () =>
      window.removeEventListener(
        OPEN_CREATE_CODE_DIALOG_EVENT,
        openProjectDialog
      );
  }, []);

  const updateConfig = useCallback(
    (
      updates: Partial<ProjectConfig>,
      historyMode: "push" | "replace" = "push"
    ) => {
      const next = { ...configRef.current, ...updates };
      const url = `${location.pathname}?${serializeConfig(next).toString()}`;
      configRef.current = next;
      setConfig(next);
      if (historyMode === "replace") {
        window.history.replaceState(null, "", url);
      } else {
        window.history.pushState(null, "", url);
      }
    },
    []
  );

  const randomize = useCallback(() => {
    const pick = <T,>(items: readonly T[]) =>
      items[Math.floor(Math.random() * items.length)] as T;
    updateConfig({
      framework: lockedFields.has("framework")
        ? configRef.current.framework
        : pick(FRAMEWORKS).name,
      template: lockedFields.has("template")
        ? configRef.current.template
        : pick(TEMPLATES).name,
      theme: lockedFields.has("theme")
        ? configRef.current.theme
        : pick(THEMES).name,
    });
  }, [lockedFields, updateConfig]);

  const toggleLock = useCallback((field: ConfigField) => {
    setLockedFields((current) => {
      const next = new Set(current);
      if (next.has(field)) {
        next.delete(field);
      } else {
        next.add(field);
      }
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    updateConfig(DEFAULT_PROJECT_CONFIG);
  }, [updateConfig]);

  const share = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    window.setTimeout(() => setShareCopied(false), 1500);
  }, []);

  const currentFramework = FRAMEWORKS.find(
    (entry) => entry.name === config.framework
  );
  const currentTemplate = TEMPLATES.find(
    (entry) => entry.name === config.template
  );
  const currentTheme = THEMES.find((entry) => entry.name === config.theme);

  return (
    <>
      <div
        data-slot="designer"
        className="flex min-h-0 flex-1 flex-col gap-(--gap) p-(--gap) pt-[calc(var(--gap)*0.25)] md:flex-row-reverse"
      >
        <ResizableTerminalWindow
          base={config.framework}
          frameworkTitle={currentFramework?.title ?? config.framework}
          name={TEMPLATE_PREVIEWS[config.template]}
          templateTitle={currentTemplate?.title ?? config.template}
          theme={config.theme}
          themeTitle={currentTheme?.title ?? config.theme}
        />

        <CreateCustomizer
          config={config}
          lockedFields={lockedFields}
          projectDialogOpen={projectDialogOpen}
          shareCopied={shareCopied}
          onConfigChange={updateConfig}
          onLockToggle={toggleLock}
          onProjectDialogOpenChange={setProjectDialogOpen}
          onRandomize={randomize}
          onReset={reset}
          onShare={share}
        />
      </div>
      <WelcomeDialog />
    </>
  );
};
