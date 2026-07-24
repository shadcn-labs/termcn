"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface ComponentIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface ComponentIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const makePathVariants = (x: number, y: number): Variants => ({
  animate: {
    transition: { duration: 0.8, ease: "easeInOut", times: [0, 0.4, 0.6, 1] },
    translateX: [0, x, x, 0],
    translateY: [0, y, y, 0],
  },
  normal: { translateX: 0, translateY: 0 },
});

const TOP_VARIANTS = makePathVariants(6.6, 6.6);
const RIGHT_VARIANTS = makePathVariants(-6.6, 6.6);
const BOTTOM_VARIANTS = makePathVariants(-6.6, -6.6);
const LEFT_VARIANTS = makePathVariants(6.6, -6.6);

const ComponentIcon = forwardRef<ComponentIconHandle, ComponentIconProps>(
  ({ onMouseEnter, onMouseLeave, className, size = 24, ...props }, ref) => {
    const controls = useAnimation();
    const isControlledRef = useRef(false);

    useImperativeHandle(ref, () => {
      isControlledRef.current = true;

      return {
        startAnimation: () => controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseEnter?.(e);
        } else {
          controls.start("animate");
        }
      },
      [controls, onMouseEnter]
    );

    const handleMouseLeave = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (isControlledRef.current) {
          onMouseLeave?.(e);
        } else {
          controls.start("normal");
        }
      },
      [controls, onMouseLeave]
    );

    return (
      <div
        className={cn(className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <svg
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            animate={controls}
            d="M8.916 4.674a1 1 0 0 0 0 1.414l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"
            initial="normal"
            variants={TOP_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M15.536 11.293a1 1 0 0 0 0 1.414l2.376 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414l-2.377-2.377a1 1 0 0 0-1.414 0z"
            initial="normal"
            variants={RIGHT_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M8.916 17.912a1 1 0 0 0 0 1.415l2.377 2.376a1 1 0 0 0 1.414 0l2.377-2.376a1 1 0 0 0 0-1.415l-2.377-2.376a1 1 0 0 0-1.414 0z"
            initial="normal"
            variants={BOTTOM_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M2.297 11.293a1 1 0 0 0 0 1.414l2.377 2.377a1 1 0 0 0 1.414 0l2.377-2.377a1 1 0 0 0 0-1.414L6.088 8.916a1 1 0 0 0-1.414 0z"
            initial="normal"
            variants={LEFT_VARIANTS}
          />
        </svg>
      </div>
    );
  }
);

ComponentIcon.displayName = "ComponentIcon";

export { ComponentIcon };
