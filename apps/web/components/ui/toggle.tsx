"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import * as React from "react";

import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 min-w-9 px-2",
        icon: "size-9",
        "icon-sm": "size-8",
        lg: "h-10 min-w-10 px-2.5",
        sm: "h-8 min-w-8 px-1.5",
      },
      variant: {
        default: "bg-transparent",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 data-[state=on]:bg-accent/80 data-[state=on]:text-accent-foreground",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 data-[state=on]:bg-secondary/60",
      },
    },
  }
);

const Toggle = ({
  className,
  variant,
  size,
  onPressedChange,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) => {
  const playOn = useFeedback({ sound: "toggleOn" });
  const playOff = useFeedback({ sound: "toggleOff" });

  const handlePressedChange = (pressed: boolean) => {
    if (pressed) {
      playOn();
    } else {
      playOff();
    }
    onPressedChange?.(pressed);
  };

  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ className, size, variant }))}
      onPressedChange={handlePressedChange}
      {...props}
    />
  );
};

export { Toggle, toggleVariants };
