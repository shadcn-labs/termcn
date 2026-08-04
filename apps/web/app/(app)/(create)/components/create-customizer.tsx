"use client";

import {
  CheckIcon,
  CopyIcon,
  DicesIcon,
  Layers3Icon,
  MonitorIcon,
  RotateCcwIcon,
} from "lucide-react";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { FRAMEWORKS, TEMPLATES, THEMES } from "@/lib/create-config";
import type {
  FrameworkName,
  ProjectConfig,
  TemplateName,
  ThemeName,
} from "@/lib/create-config";
import { themePrimaryBySlug } from "@/lib/terminal-themes";

import { ConfigPicker } from "./config-picker";
import { CustomizerMenu } from "./customizer-menu";
import { ProjectDialog } from "./project-dialog";

type ConfigField = keyof ProjectConfig;

export interface CreateCustomizerProps {
  config: ProjectConfig;
  lockedFields: ReadonlySet<ConfigField>;
  onConfigChange: (updates: Partial<ProjectConfig>) => void;
  onLockToggle: (field: ConfigField) => void;
  onProjectDialogOpenChange: (open: boolean) => void;
  onRandomize: () => void;
  onReset: () => void;
  onShare: () => void;
  projectDialogOpen: boolean;
  shareCopied: boolean;
}

export const CreateCustomizer = ({
  config,
  lockedFields,
  onConfigChange,
  onLockToggle,
  onProjectDialogOpenChange,
  onRandomize,
  onReset,
  onShare,
  projectDialogOpen,
  shareCopied,
}: CreateCustomizerProps) => {
  const isMobile = useIsMobile();
  const customizerRef = useRef<HTMLDivElement | null>(null);

  return (
    <Card
      ref={customizerRef}
      className="dark top-24 right-12 isolate z-10 max-h-full min-h-[151px] w-full shrink-0 self-start gap-0 overflow-hidden rounded-2xl bg-card/90 py-0 text-card-foreground backdrop-blur-xl md:min-h-0 md:w-(--customizer-width) md:self-stretch"
    >
      <CardHeader className="hidden shrink-0 border-b border-white/10 px-3 py-3 [.border-b]:pb-3 md:block">
        <CustomizerMenu
          onRandomize={onRandomize}
          onReset={onReset}
          onShare={onShare}
        />
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
              onConfigChange({ framework: framework as FrameworkName })
            }
            onLockToggle={() => onLockToggle("framework")}
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
            onChange={(theme) => onConfigChange({ theme: theme as ThemeName })}
            onLockToggle={() => onLockToggle("theme")}
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
              onConfigChange({ template: template as TemplateName })
            }
            onLockToggle={() => onLockToggle("template")}
          />
        </div>
      </CardContent>

      <CardFooter className="flex min-w-0 shrink-0 gap-2 border-t [.border-t]:pt-3 border-white/10 px-3 py-3 md:flex-col md:**:[button]:w-full">
        <Button
          className="min-w-0 flex-1 md:flex-none"
          variant="outline"
          onClick={onShare}
        >
          {shareCopied ? <CheckIcon /> : <CopyIcon />}
          {shareCopied ? "Copied" : "Copy"}
        </Button>
        <Button
          className="min-w-0 sm:max-w-none md:flex-none"
          variant="outline"
          onClick={onReset}
        >
          <RotateCcwIcon />
          Reset
        </Button>
        <Button
          className="min-w-0 sm:max-w-none md:flex-none"
          variant="outline"
          onClick={onRandomize}
        >
          <DicesIcon />
          Shuffle
        </Button>
      </CardFooter>
      <CardFooter className="border-t [.border-t]:pt-3 hidden min-w-0 shrink-0 px-3 pb-3 md:flex md:flex-col md:**:[button]:w-full">
        <ProjectDialog
          config={config}
          open={projectDialogOpen}
          onOpenChange={onProjectDialogOpenChange}
        />
      </CardFooter>
    </Card>
  );
};
