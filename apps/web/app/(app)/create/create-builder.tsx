"use client";

import {
  CheckIcon,
  Code2Icon,
  DicesIcon,
  ExternalLinkIcon,
  Layers3Icon,
  LockIcon,
  MenuIcon,
  MonitorIcon,
  PackageIcon,
  PaletteIcon,
  RotateCcwIcon,
  Share2Icon,
  TerminalIcon,
  UnlockIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CopyButton } from "@/components/copy-button";
import { TerminalPreview } from "@/components/terminal-preview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
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
import { OPEN_CREATE_CODE_DIALOG_EVENT } from "@/lib/create-events";
import { themePrimaryBySlug } from "@/lib/terminal-themes";

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

export function CreateBuilder() {
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const customizerRef = useRef<HTMLDivElement | null>(null);
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
        <section className="relative flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden rounded-2xl ring ring-foreground/10 md:ring-muted dark:ring-foreground/10">
          <div className="relative z-0 mx-auto flex w-full flex-1 flex-col overflow-hidden">
            <div className="absolute inset-0 bg-muted dark:bg-muted/30" />
            <div className="border-border/60 bg-background/85 relative z-10 flex h-12 shrink-0 items-center gap-2 border-b px-3 backdrop-blur-sm sm:px-4">
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
            <div className="relative z-10 flex min-h-0 flex-1 items-start justify-center overflow-auto p-3 sm:p-6 md:items-center">
              <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-black/20">
                <TerminalPreview
                  base={config.framework}
                  name={TEMPLATE_PREVIEWS[config.template]}
                  rows={30}
                  theme={config.theme}
                />
              </div>
            </div>
          </div>
        </section>

        <Card
          ref={customizerRef}
          className="dark top-24 right-12 isolate z-10 max-h-full min-h-[151px] w-full shrink-0 self-start gap-0 overflow-hidden rounded-2xl bg-card/90 py-0 text-card-foreground backdrop-blur-xl md:min-h-0 md:w-(--customizer-width) md:self-stretch"
        >
          <CardHeader className="hidden shrink-0 border-b border-white/10 px-3 py-3 md:block">
            <CustomizerMenu randomize={randomize} reset={reset} share={share} />
          </CardHeader>

          <CardContent className="no-scrollbar min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-3 py-3 md:overflow-y-auto">
            <div className="flex min-w-max flex-row gap-2.5 py-px md:min-w-0 md:flex-col md:gap-3.25">
              <ConfigPicker
                indicator={<Layers3Icon className="size-4" />}
                anchorRef={customizerRef}
                isMobile={isMobile}
                label="Framework"
                locked={lockedFields.has("framework")}
                value={config.framework}
                options={FRAMEWORKS}
                onChange={(framework) =>
                  updateConfig({ framework: framework as FrameworkName })
                }
                onLockToggle={() => toggleLock("framework")}
              />
              <div className="-mx-3 hidden h-px bg-white/10 md:block" />
              <ConfigPicker
                indicator={
                  <span
                    className="size-4 rounded-full"
                    style={{
                      background:
                        themePrimaryBySlug[config.theme] ??
                        "var(--color-muted-foreground)",
                    }}
                  />
                }
                anchorRef={customizerRef}
                isMobile={isMobile}
                label="Theme"
                locked={lockedFields.has("theme")}
                value={config.theme}
                options={THEMES}
                onChange={(theme) =>
                  updateConfig({ theme: theme as ThemeName })
                }
                onLockToggle={() => toggleLock("theme")}
              />
              <ConfigPicker
                indicator={<MonitorIcon className="size-4" />}
                anchorRef={customizerRef}
                isMobile={isMobile}
                label="Template"
                locked={lockedFields.has("template")}
                value={config.template}
                options={TEMPLATES}
                onChange={(template) =>
                  updateConfig({ template: template as TemplateName })
                }
                onLockToggle={() => toggleLock("template")}
              />
            </div>
          </CardContent>

          <CardFooter className="flex min-w-0 shrink-0 gap-2 border-t border-white/10 px-3 py-3 md:flex-col md:**:[button]:w-full">
            <Button
              className="min-w-0 flex-1 md:flex-none"
              variant="outline"
              onClick={share}
            >
              {shareCopied ? <CheckIcon /> : <Share2Icon />}
              {shareCopied ? "Link copied" : "Copy link"}
            </Button>
            <Button
              className="max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none"
              variant="outline"
              onClick={reset}
            >
              <RotateCcwIcon />
              Reset
            </Button>
            <Button
              className="max-w-20 min-w-0 flex-1 sm:max-w-none md:flex-none"
              variant="outline"
              onClick={randomize}
            >
              <DicesIcon />
              Shuffle
            </Button>
          </CardFooter>
          <CardFooter className="-mt-3 hidden min-w-0 shrink-0 px-3 pb-3 md:flex md:flex-col md:**:[button]:w-full">
            <ProjectDialog
              config={config}
              open={projectDialogOpen}
              onOpenChange={setProjectDialogOpen}
            />
          </CardFooter>
        </Card>
      </div>
      <WelcomeDialog />
    </>
  );
}

function ConfigPicker({
  anchorRef,
  indicator,
  isMobile,
  label,
  locked,
  onChange,
  onLockToggle,
  options,
  value,
}: {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  indicator: React.ReactNode;
  isMobile: boolean;
  label: string;
  locked: boolean;
  onChange: (value: string) => void;
  onLockToggle: () => void;
  options: readonly { name: string; title: string }[];
  value: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.name === value);

  return (
    <div className="group/picker relative">
      <Popover sounds open={open} onOpenChange={setOpen}>
        {isMobile && (
          <PopoverAnchor
            virtualRef={anchorRef as React.RefObject<HTMLDivElement>}
          />
        )}
        <PopoverTrigger asChild>
          <button
            type="button"
            className="relative w-36 shrink-0 touch-manipulation rounded-xl p-3 ring-1 ring-foreground/10 select-none hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none data-[state=open]:bg-muted md:w-full md:rounded-lg md:px-2.5 md:py-2"
          >
            <span className="flex min-w-0 flex-col justify-start pr-12 text-left">
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="truncate text-sm font-medium text-foreground">
                {selected?.title}
              </span>
            </span>
            <span className="pointer-events-none absolute top-1/2 right-4 flex size-4 -translate-y-1/2 items-center justify-center text-foreground select-none md:right-2.5">
              {indicator}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          side={isMobile ? "top" : "right"}
          align={isMobile ? "center" : "start"}
          sideOffset={20}
          className="no-scrollbar max-h-92 w-[calc(var(--radix-popover-content-available-width)-(--spacing(6)))] min-w-32 overflow-x-hidden overflow-y-auto rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl md:w-52 dark:bg-neutral-800/90 dark:ring-neutral-700/50"
        >
          <div role="radiogroup" aria-label={label}>
            {options.map((option) => {
              const selectedOption = option.name === value;
              return (
                <button
                  key={option.name}
                  type="button"
                  role="radio"
                  aria-checked={selectedOption}
                  className="relative flex w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-left text-sm font-medium text-neutral-100 outline-hidden select-none hover:bg-neutral-600 focus-visible:bg-neutral-600 focus-visible:outline-none dark:hover:bg-neutral-700/80 dark:focus-visible:bg-neutral-700/80"
                  onClick={() => {
                    onChange(option.name);
                    setOpen(false);
                  }}
                >
                  {option.title}
                  {selectedOption && (
                    <CheckIcon className="absolute right-2 size-4" />
                  )}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        title={locked ? `Unlock ${label}` : `Lock ${label}`}
        aria-label={locked ? `Unlock ${label}` : `Lock ${label}`}
        data-locked={locked}
        className="absolute top-1/2 right-8 z-10 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded opacity-0 outline-none ring-foreground/60 transition-opacity group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus:opacity-100 focus-visible:ring-1 data-[locked=true]:opacity-100"
        onClick={onLockToggle}
      >
        {locked ? (
          <LockIcon className="size-4 text-foreground" />
        ) : (
          <UnlockIcon className="size-4 text-foreground" />
        )}
      </button>
    </div>
  );
}

function CustomizerMenu({
  randomize,
  reset,
  share,
}: {
  randomize: () => void;
  reset: () => void;
  share: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = [
    { action: share, label: "Copy link" },
    { action: randomize, label: "Shuffle" },
    { action: reset, label: "Reset" },
  ];

  return (
    <Popover sounds open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-full items-center justify-between gap-2 rounded-lg px-2.5 ring-1 ring-foreground/10 hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none data-[state=open]:bg-muted"
        >
          <span className="text-sm font-medium">Menu</span>
          <MenuIcon className="size-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        alignOffset={-8}
        sideOffset={20}
        className="w-52 rounded-xl border-0 bg-neutral-950/80 p-1.5 text-neutral-100 ring-1 ring-neutral-950/80 backdrop-blur-xl dark:bg-neutral-800/90 dark:ring-neutral-700/50"
      >
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex w-full items-center rounded-lg px-2 py-1.5 text-sm font-medium hover:bg-neutral-600 focus-visible:bg-neutral-600 focus-visible:outline-none dark:hover:bg-neutral-700/80 dark:focus-visible:bg-neutral-700/80"
            onClick={() => {
              item.action();
              setOpen(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function ProjectDialog({
  config,
  onOpenChange,
  open,
}: {
  config: ProjectConfig;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
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
    <Dialog sounds open={open} onOpenChange={onOpenChange}>
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
        </div>
      </DialogContent>
    </Dialog>
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
