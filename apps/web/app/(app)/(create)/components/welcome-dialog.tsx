"use client";

import {
  ExternalLinkIcon,
  Layers3Icon,
  PackageIcon,
  PaletteIcon,
  TerminalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const WELCOME_STORAGE_KEY = "termcn-create-welcome";

const WelcomeFeature = ({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) => (
  <div className="flex gap-3 rounded-xl border p-3">
    <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
      <Icon className="size-4" />
    </div>
    <div className="min-w-0">
      <div className="text-sm font-medium">{title}</div>
      <div className="text-muted-foreground mt-0.5 text-sm">{description}</div>
    </div>
  </div>
);

export const WelcomeDialog = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(WELCOME_STORAGE_KEY) !== "seen") {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      localStorage.setItem(WELCOME_STORAGE_KEY, "seen");
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
};
