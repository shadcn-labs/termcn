"use client";

import {
  CheckIcon,
  ChevronDownIcon,
  Code2Icon,
  DicesIcon,
  ExternalLinkIcon,
  Layers3Icon,
  MonitorIcon,
  PackageIcon,
  PaletteIcon,
  RotateCcwIcon,
  Share2Icon,
  SparklesIcon,
  TerminalIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { TerminalPreview } from "@/components/terminal-preview";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildInitCommand,
  DEFAULT_PROJECT_CONFIG,
  FRAMEWORKS,
  PACKAGE_MANAGERS,
  TEMPLATES,
  THEMES,
} from "@/lib/create-config";
import type {
  FrameworkName,
  PackageManager,
  ProjectConfig,
  TemplateName,
  ThemeName,
} from "@/lib/create-config";
import { themePrimaryBySlug } from "@/lib/terminal-themes";

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

export function CreateBuilder() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<ProjectConfig>(() =>
    getConfigFromSearchParams(searchParams)
  );
  const configRef = useRef(config);
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
      framework: pick(FRAMEWORKS).name,
      template: pick(TEMPLATES).name,
      theme: pick(THEMES).name,
    });
  }, [updateConfig]);

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
        <section className="border-border/70 bg-background/80 relative flex min-h-[34rem] min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border shadow-sm backdrop-blur-xl">
          <div className="border-border/70 flex h-12 shrink-0 items-center gap-2 border-b px-3 sm:px-4">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="size-2.5 rounded-full bg-red-500/70" />
              <span className="size-2.5 rounded-full bg-amber-500/70" />
              <span className="size-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="text-muted-foreground ml-2 flex min-w-0 items-center gap-2 text-xs">
              <TerminalIcon className="size-3.5" />
              <span className="truncate">
                {currentTemplate?.title} · {currentFramework?.title}
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    themePrimaryBySlug[config.theme] ?? "currentColor",
                }}
              />
              <span className="text-muted-foreground hidden text-xs sm:inline">
                {currentTheme?.title}
              </span>
            </div>
          </div>
          <div className="bg-surface/30 relative flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-6">
            <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/20">
              <TerminalPreview
                base={config.framework}
                name={TEMPLATE_PREVIEWS[config.template]}
                rows={30}
                theme={config.theme}
              />
            </div>
          </div>
          <div className="border-border/70 bg-background/80 flex min-h-12 shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 text-xs">
            <span className="text-muted-foreground">
              Framework{" "}
              <span className="text-foreground font-medium">
                {currentFramework?.title}
              </span>
            </span>
            <span className="text-muted-foreground">
              Theme{" "}
              <span className="text-foreground font-medium">
                {currentTheme?.title}
              </span>
            </span>
            <span className="text-muted-foreground">
              Template{" "}
              <span className="text-foreground font-medium">
                {currentTemplate?.title}
              </span>
            </span>
          </div>
        </section>

        <aside className="dark bg-card/90 text-card-foreground isolate z-10 flex max-h-full min-h-0 w-full shrink-0 flex-col self-start overflow-hidden rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl md:h-full md:w-(--customizer-width)">
          <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <span className="text-sm font-medium">Customize</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={share}
                aria-label="Copy share link"
              >
                {shareCopied ? (
                  <CheckIcon className="size-3.5" />
                ) : (
                  <Share2Icon className="size-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={reset}
                aria-label="Reset"
              >
                <RotateCcwIcon className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
            <div className="flex flex-col divide-y divide-white/10">
              <FieldSelect
                icon={Layers3Icon}
                label="Framework"
                value={config.framework}
                options={FRAMEWORKS}
                onChange={(framework) =>
                  updateConfig({ framework: framework as FrameworkName })
                }
              />
              <FieldSelect
                icon={PaletteIcon}
                label="Theme"
                value={config.theme}
                options={THEMES}
                onChange={(theme) =>
                  updateConfig({ theme: theme as ThemeName })
                }
                color={
                  themePrimaryBySlug[config.theme] ??
                  "var(--color-muted-foreground)"
                }
              />
              <FieldSelect
                icon={MonitorIcon}
                label="Template"
                value={config.template}
                options={TEMPLATES}
                onChange={(template) =>
                  updateConfig({ template: template as TemplateName })
                }
              />
            </div>
          </div>

          <div className="grid gap-2 border-t border-white/10 p-4">
            <Button variant="secondary" onClick={randomize}>
              <DicesIcon />
              Randomize
            </Button>
            <ProjectDialog config={config} />
          </div>
        </aside>
      </div>
      <WelcomeDialog />
    </>
  );
}

function FieldSelect({
  color,
  icon: Icon,
  label,
  onChange,
  options,
  value,
}: {
  color?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onChange: (value: string) => void;
  options: readonly { name: string; title: string }[];
  value: string;
}) {
  return (
    <label className="group grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2 py-4 first:pt-1 last:pb-1">
      <span className="text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5">
        {color ? (
          <span
            className="size-2.5 rounded-full"
            style={{ background: color }}
          />
        ) : (
          <Icon className="size-3.5" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-sm">{label}</span>
      <span className="relative col-span-2 w-full">
        <select
          aria-label={label}
          className="h-8 w-full appearance-none truncate rounded-md border border-white/10 bg-white/5 py-1 pr-7 pl-2.5 text-left text-xs outline-none transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-primary/50"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.name} value={option.name}>
              {option.title}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-2 size-3 -translate-y-1/2" />
      </span>
    </label>
  );
}

function ProjectDialog({ config }: { config: ProjectConfig }) {
  const [packageManager, setPackageManager] = useState<PackageManager>("pnpm");
  const [name, setName] = useState("my-terminal-app");

  const safeName =
    name.trim().replaceAll(/[^a-zA-Z0-9@/_.-]/g, "-") || "my-terminal-app";
  const command = useMemo(
    () =>
      buildInitCommand({
        ...config,
        name: safeName,
        packageManager,
      }),
    [config, packageManager, safeName]
  );

  return (
    <Dialog sounds>
      <DialogTrigger asChild>
        <Button>
          <Code2Icon />
          Get Code
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b p-6">
          <DialogTitle>Create your project</DialogTitle>
          <DialogDescription>
            Run this command to scaffold the selected termcn setup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 p-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium" htmlFor="project-name">
              Project name
            </label>
            <Input
              id="project-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="my-terminal-app"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <Tabs
            value={packageManager}
            onValueChange={(value) =>
              setPackageManager(value as PackageManager)
            }
          >
            <TabsList className="grid h-9 w-full grid-cols-4">
              {PACKAGE_MANAGERS.map((manager) => (
                <TabsTrigger key={manager} value={manager}>
                  {manager}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="bg-code relative overflow-hidden rounded-xl border">
            <div className="border-b px-4 py-2 text-xs text-muted-foreground">
              Terminal
            </div>
            <pre className="overflow-x-auto p-4 pr-12 text-sm">
              <code>{command}</code>
            </pre>
            <CopyButton
              value={command}
              className="top-10 right-3"
              aria-label="Copy init command"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <SummaryItem label="Framework" value={config.framework} />
            <SummaryItem label="Theme" value={config.theme} />
            <SummaryItem label="Template" value={config.template} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/50 min-w-0 rounded-lg border p-3">
      <div className="text-muted-foreground">{label}</div>
      <div className="mt-1 truncate font-medium">{value}</div>
    </div>
  );
}

function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("termcn-create-welcome") !== "seen") {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      localStorage.setItem("termcn-create-welcome", "seen");
    }
  };

  return (
    <Dialog sounds open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <div className="from-primary/15 via-background to-background relative overflow-hidden border-b bg-gradient-to-br p-8">
          <div className="bg-primary/10 mb-5 flex size-12 items-center justify-center rounded-2xl border border-primary/20">
            <TerminalIcon className="size-6 text-primary" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Design your terminal app
            </DialogTitle>
            <DialogDescription className="max-w-md text-base">
              Pick a renderer, theme, and starter. The preview and install
              command update together.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="grid gap-3 p-6">
          <WelcomeFeature
            icon={Layers3Icon}
            title="Choose your renderer"
            description="Switch between Ink and OpenTUI without changing the workflow."
          />
          <WelcomeFeature
            icon={PaletteIcon}
            title="Preview every theme"
            description="All registry themes render against the selected starter."
          />
          <WelcomeFeature
            icon={PackageIcon}
            title="Copy one command"
            description="The CLI writes config, installs registry items, and scaffolds the app."
          />
          <Button className="mt-2" onClick={() => handleOpenChange(false)}>
            Start creating
            <ExternalLinkIcon />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeFeature({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border p-3">
      <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-muted-foreground mt-0.5 text-sm">
          {description}
        </div>
      </div>
    </div>
  );
}
