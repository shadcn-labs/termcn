"use client";

import { CheckIcon, LockIcon, UnlockIcon } from "lucide-react";
import { useState } from "react";

import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface ConfigPickerProps {
  anchorRef: React.RefObject<HTMLDivElement | null>;
  indicator: React.ReactNode;
  isMobile: boolean;
  label: string;
  locked: boolean;
  onChange: (value: string) => void;
  onLockToggle: () => void;
  options: readonly { name: string; title: string }[];
  value: string;
}

export const ConfigPicker = ({
  anchorRef,
  indicator,
  isMobile,
  label,
  locked,
  onChange,
  onLockToggle,
  options,
  value,
}: ConfigPickerProps) => {
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
        className="absolute top-1/2 right-9 z-10 flex size-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded opacity-0 outline-none ring-foreground/60 transition-opacity group-focus-within/picker:opacity-100 group-hover/picker:opacity-100 focus:opacity-100 focus-visible:ring-1 data-[locked=true]:opacity-100 md:right-8"
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
};
