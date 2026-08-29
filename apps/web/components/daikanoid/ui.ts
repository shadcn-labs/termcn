import type { GameColors } from "./colors";
import { CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_Y } from "./constants";
import type { GameState } from "./types";

export class UI {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  show(
    context: CanvasRenderingContext2D,
    colors: GameColors,
    monoFont: string
  ) {
    this.showScore(context, colors, monoFont);

    if (!this.state.enableGame) {
      context.fillStyle = colors.mutedForeground;
      context.font = `400 12px ${monoFont}`;
      context.textAlign = "center";
      context.textBaseline = "bottom";
      context.fillText(
        "CLICK OR PRESS SPACE TO LAUNCH",
        CANVAS_WIDTH / 2,
        PADDLE_Y - 18
      );
    }
  }

  showCompletion(
    context: CanvasRenderingContext2D,
    colors: GameColors,
    monoFont: string
  ) {
    this.showScore(context, colors, monoFont);
    context.fillStyle = colors.foreground;
    context.font = `500 80px ${monoFont}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("404", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 10);
  }

  private showScore(
    context: CanvasRenderingContext2D,
    colors: GameColors,
    monoFont: string
  ) {
    context.fillStyle = colors.foreground;
    context.font = `400 16px ${monoFont}`;
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText(
      this.state.score.toString().padStart(3, "0"),
      CANVAS_WIDTH - 4,
      4
    );
  }
}
