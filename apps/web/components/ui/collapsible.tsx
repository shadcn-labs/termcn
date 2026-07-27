"use client";

import { Collapsible as CollapsiblePrimitive } from "radix-ui";
import { useCallback, useEffect, useRef } from "react";

import { collapse, expand } from "@/audio/core";
import { useFeedback } from "@/hooks/use-feedback";

const Collapsible = ({
  onOpenChange,
  sounds = false,
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root> & {
  sounds?: boolean;
}) => {
  const playExpand = useFeedback({ soundDef: expand });
  const playCollapse = useFeedback({ soundDef: collapse });
  const isControlled = props.open !== undefined;
  const lastOpen = useRef(props.open ?? props.defaultOpen ?? false);

  const playStateSound = useCallback(
    (open: boolean) => {
      if (!sounds || open === lastOpen.current) {
        return;
      }

      if (open) {
        playExpand();
      } else {
        playCollapse();
      }

      lastOpen.current = open;
    },
    [playCollapse, playExpand, sounds]
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
      <CollapsiblePrimitive.Root
        data-slot="collapsible"
        onOpenChange={onOpenChange}
        {...props}
      />
    );
  }

  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      onOpenChange={handleOpenChange}
      {...props}
    />
  );
};

const CollapsibleTrigger = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    data-slot="collapsible-trigger"
    {...props}
  />
);

const CollapsibleContent = ({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => (
  <CollapsiblePrimitive.CollapsibleContent
    data-slot="collapsible-content"
    {...props}
  />
);

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
