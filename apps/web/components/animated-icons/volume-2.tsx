"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface Volume2IconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface Volume2IconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

const makeWaveVariants = (delay: number): Variants => ({
  animate: {
    opacity: 0,
    scale: 0,
    transition: {
      opacity: {
        delay,
        duration: 0.2,
        ease: "easeInOut",
        repeat: 1,
        repeatDelay: 0.2,
        repeatType: "reverse",
      },
      scale: {
        delay,
        duration: 0.2,
        ease: "easeInOut",
        repeat: 1,
        repeatDelay: 0.2,
        repeatType: "reverse",
      },
    },
  },
  normal: { opacity: 1, scale: 1 },
});

const INNER_WAVE_VARIANTS = makeWaveVariants(0);
const OUTER_WAVE_VARIANTS = makeWaveVariants(0.2);

const Volume2Icon = forwardRef<Volume2IconHandle, Volume2IconProps>(
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
            d="M16 9a5 5 0 0 1 0 6"
            initial="normal"
            variants={INNER_WAVE_VARIANTS}
          />
          <motion.path
            animate={controls}
            d="M19.364 18.364a9 9 0 0 0 0-12.728"
            initial="normal"
            variants={OUTER_WAVE_VARIANTS}
          />
          <path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" />
        </svg>
      </div>
    );
  }
);

Volume2Icon.displayName = "Volume2Icon";

export { Volume2Icon };
