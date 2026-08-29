import type { GameColors } from "./colors";
import {
  CANVAS_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_SPEED,
  PADDLE_WIDTH,
  PADDLE_Y,
  uncheckedClamp,
} from "./constants";

export class Paddle {
  width = PADDLE_WIDTH;
  height = PADDLE_HEIGHT;
  x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
  y = PADDLE_Y;

  private moveLeft = false;
  private moveRight = false;

  show(context: CanvasRenderingContext2D, colors: GameColors) {
    context.fillStyle = colors.foreground;
    context.fillRect(this.x, this.y, this.width, this.height);

    context.save();
    context.globalAlpha = 0.25;
    context.fillStyle = colors.background;
    context.fillRect(this.x + 5, this.y + 4, this.width - 10, 3);
    context.restore();
  }

  move(frameScale: number) {
    if (this.moveLeft) {
      this.x -= PADDLE_SPEED * frameScale;
    }
    if (this.moveRight) {
      this.x += PADDLE_SPEED * frameScale;
    }

    this.x = uncheckedClamp(0, CANVAS_WIDTH - this.width, this.x);
  }

  moveTo(clientX: number, bounds: DOMRect) {
    const pointerX = ((clientX - bounds.left) / bounds.width) * CANVAS_WIDTH;
    this.x = uncheckedClamp(
      0,
      CANVAS_WIDTH - this.width,
      pointerX - this.width / 2
    );
  }

  setKey(code: string, pressed: boolean) {
    if (code === "ArrowLeft") {
      this.moveLeft = pressed;
    }
    if (code === "ArrowRight") {
      this.moveRight = pressed;
    }
  }
}
