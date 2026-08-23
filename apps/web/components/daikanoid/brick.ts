import type { GameColors } from "./colors";
import { BRICK_SIZE, CANVAS_WIDTH, LOGO_COLUMNS, LOGO_TOP } from "./constants";
import { loadLogoPattern } from "./logos";
import type { GameState } from "./types";

export class Brick {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  show(context: CanvasRenderingContext2D, colors: GameColors) {
    context.fillStyle = colors.foreground;
    context.fillRect(this.x + 2, this.y + 2, this.w - 4, this.h - 4);

    context.save();
    context.globalAlpha = 0.22;
    context.fillStyle = colors.background;
    context.fillRect(this.x + 5, this.y + 5, this.w - 10, 3);
    context.fillRect(this.x + 5, this.y + 8, 3, this.h - 16);
    context.restore();
  }
}

export const resetGame = async (state: GameState) => {
  const pattern = await loadLogoPattern();
  const left = (CANVAS_WIDTH - LOGO_COLUMNS * BRICK_SIZE) / 2;

  state.score = 0;
  state.enableGame = false;
  state.bricks = pattern.flatMap((row, rowIndex) =>
    [...row].flatMap((pixel, columnIndex) =>
      pixel === "X"
        ? [
            new Brick(
              left + columnIndex * BRICK_SIZE,
              LOGO_TOP + rowIndex * BRICK_SIZE,
              BRICK_SIZE,
              BRICK_SIZE
            ),
          ]
        : []
    )
  );
};
