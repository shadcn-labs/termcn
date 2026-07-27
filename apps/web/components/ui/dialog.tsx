"use client";

import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useRef } from "react";

import { modalOpen, modalClose } from "@/audio/core";
import { useFeedback } from "@/hooks/use-feedback";
import { cn } from "@/lib/utils";

const Dialog = ({
  onOpenChange,
  sounds = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  sounds?: boolean;
}) => {
  const playOpen = useFeedback({ soundDef: modalOpen });
  const playClose = useFeedback({ soundDef: modalClose });
  const isControlled = props.open !== undefined;
  const lastOpen = useRef(props.open ?? props.defaultOpen ?? false);

  const playStateSound = useCallback(
    (open: boolean) => {
      if (!sounds || open === lastOpen.current) {
        return;
      }

      if (open) {
        playOpen();
      } else {
        playClose();
      }

      lastOpen.current = open;
    },
    [playClose, playOpen, sounds]
  );

  useEffect(() => {
    if (!isControlled) {
      return;
    }

    playStateSound(props.open ?? false);
  }, [isControlled, playStateSound, props.open]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      playStateSound(open);
      onOpenChange?.(open);
    },
    [onOpenChange, playStateSound]
  );

  if (!sounds) {
    return (
      <DialogPrimitive.Root
        data-slot="dialog"
        onOpenChange={onOpenChange}
        {...props}
      />
    );
  }

  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
};

const DialogTrigger = ({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
);

const DialogPortal = ({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) => (
  <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
);

const DialogClose = ({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
);

const DialogOverlay = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    data-slot="dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
      className
    )}
    {...props}
  />
);

const DialogContent = ({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) => (
  <DialogPortal data-slot="dialog-portal">
    <DialogOverlay />
    <DialogPrimitive.Content
      data-slot="dialog-content"
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
        >
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
);

const DialogHeader = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-header"
    className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
    {...props}
  />
);

const DialogFooter = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div
    data-slot="dialog-footer"
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);

const DialogTitle = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    data-slot="dialog-title"
    className={cn("text-lg leading-none font-semibold", className)}
    {...props}
  />
);

const DialogDescription = ({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) => (
  <DialogPrimitive.Description
    data-slot="dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
);

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
