"use client";

import { Code2Icon } from "lucide-react";
import { useMemo, useState } from "react";

import { CopyButton } from "@/components/copy-button";
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
import { buildInitCommand, PACKAGE_MANAGERS } from "@/lib/create-config";
import type { PackageManager, ProjectConfig } from "@/lib/create-config";

export interface ProjectDialogProps {
  config: ProjectConfig;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export const ProjectDialog = ({
  config,
  onOpenChange,
  open,
}: ProjectDialogProps) => {
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
};
