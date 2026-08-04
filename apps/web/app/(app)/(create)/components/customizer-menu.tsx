"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CustomizerMenuProps {
  onRandomize: () => void;
  onReset: () => void;
  onShare: () => void;
}

export const CustomizerMenu = ({
  onRandomize,
  onReset,
  onShare,
}: CustomizerMenuProps) => {
  const [open, setOpen] = useState(false);
  const items = [
    { action: onShare, label: "Copy link" },
    { action: onRandomize, label: "Shuffle" },
    { action: onReset, label: "Reset" },
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
};
