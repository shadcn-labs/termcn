"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import { Ball } from "./ball";
import { resetGame } from "./brick";
import { loadColors } from "./colors";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  SOUND_BOUNCE_URL,
  SOUND_BREAK_URL,
  SOUND_GAME_OVER_URL,
} from "./constants";
import { Paddle } from "./paddle";
import type { GameState } from "./types";
import { UI } from "./ui";

const createSound = (source: string) => {
  const sound = new Audio(source);
  sound.preload = "auto";
  return sound;
};

export const Daikanoid = ({
  className,
  ...props
}: Omit<
  React.ComponentPropsWithRef<"canvas">,
  "children" | "height" | "width"
>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    const colors = loadColors();
    const soundBounce = createSound(SOUND_BOUNCE_URL);
    const soundBreak = createSound(SOUND_BREAK_URL);
    const soundGameOver = createSound(SOUND_GAME_OVER_URL);
    const state: GameState = {
      bricks: [],
      enableGame: false,
      enableSounds: !shouldReduceMotion,
      score: 0,
      soundBounce,
      soundBreak,
      soundGameOver,
    };
    const ball = new Ball(state);
    const paddle = new Paddle();
    const ui = new UI(state);
    const monoFont =
      getComputedStyle(document.body).getPropertyValue("--font-mono").trim() ||
      "monospace";

    let animationFrame = 0;
    let disposed = false;
    let previousTime = performance.now();

    const launchBall = async () => {
      if (state.bricks.length === 0) {
        await resetGame(state);
      }
      if (disposed) {
        return;
      }

      state.enableGame = true;
      ball.reset();
    };

    const handlePointerMove = (event: PointerEvent) => {
      paddle.moveTo(event.clientX, canvas.getBoundingClientRect());
    };

    const handlePointerDown = () => {
      canvas.focus();
      void launchBall();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (document.activeElement !== canvas) {
        return;
      }

      if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }

      paddle.setKey(event.code, true);
      if (event.code === "Space") {
        void launchBall();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      paddle.setKey(event.code, false);
    };

    const update = (frameScale: number) => {
      paddle.move(frameScale);
      if (!state.enableGame) {
        return;
      }

      ball.move(frameScale);
      ball.checkEdges();
      ball.checkPaddle(paddle);
      ball.checkBricks();
    };

    const draw = () => {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (state.bricks.length === 0) {
        ui.showCompletion(context, colors, monoFont);
        return;
      }

      paddle.show(context, colors);
      ball.show(context, colors);
      for (const brick of state.bricks) {
        brick.show(context, colors);
      }
      ui.show(context, colors, monoFont);
    };

    const tick = (time: number) => {
      const frameScale = Math.min((time - previousTime) / (1000 / 60), 2);
      previousTime = time;
      update(frameScale);
      draw();
      animationFrame = requestAnimationFrame(tick);
    };

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    const start = async () => {
      await resetGame(state);
      if (!disposed) {
        ball.reset();
        animationFrame = requestAnimationFrame(tick);
      }
    };

    void start();

    return () => {
      disposed = true;
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      soundBounce.pause();
      soundBreak.pause();
      soundGameOver.pause();
    };
  }, [resolvedTheme, shouldReduceMotion]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      tabIndex={0}
      aria-label="Page not found. Interactive Breakout game built from the Shadcn Labs logo. Click or press Space to launch, then use the pointer or arrow keys to move."
      className={cn(
        "aspect-4/3 h-auto w-full max-w-200 touch-none cursor-none ring-1 ring-border outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
};
