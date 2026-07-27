"use client";

import { ChevronDownIcon } from "lucide-react";

import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";

const NativeSelect = ({
  className,
  size = "default",
  onChange,
  ...props
}: Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
}) => {
  const playSelect = useFeedback({ sound: "select" });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    playSelect();
    onChange?.(e);
  };

  return (
    <div
      className="group/native-select relative w-fit has-[select:disabled]:opacity-50"
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-input bg-transparent px-3 py-2 pr-9 text-sm shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed dark:bg-input/30 dark:hover:bg-input/50",
          "data-[size=sm]:h-8 data-[size=sm]:rounded-sm data-[size=sm]:px-2.5 data-[size=sm]:py-1 data-[size=sm]:pr-7 data-[size=sm]:text-xs",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
          className
        )}
        onChange={handleChange}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground opacity-50 select-none group-data-[size=sm]/native-select:right-2.5 group-data-[size=sm]/native-select:size-3.5"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
};

const NativeSelectOption = ({
  className,
  ...props
}: React.ComponentProps<"option">) => (
  <option
    data-slot="native-select-option"
    className={cn("bg-[Canvas] text-[CanvasText]", className)}
    {...props}
  />
);

const NativeSelectOptGroup = ({
  className,
  ...props
}: React.ComponentProps<"optgroup">) => (
  <optgroup
    data-slot="native-select-optgroup"
    className={cn("bg-[Canvas] text-[CanvasText]", className)}
    {...props}
  />
);

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
