import type { Brick } from "./brick";
import type { GameColors } from "./colors";
import {
  BALL_RADIUS,
  BALL_SPEED,
  BRICK_SCORE,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  PADDLE_Y,
  SOUND_VOLUME,
  uncheckedClamp,
} from "./constants";
import type { Paddle } from "./paddle";
import type { GameState } from "./types";

const playSound = async (sound: HTMLAudioElement) => {
  sound.currentTime = 0;
  sound.volume = SOUND_VOLUME;

  try {
    await sound.play();
  } catch {
    // Browsers can block audio until the user has interacted with the canvas.
  }
};

export class Ball {
  radius = BALL_RADIUS;
  x = CANVAS_WIDTH / 2;
  y = PADDLE_Y - 56;
  xSpeed = 0;
  ySpeed = 0;

  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
    this.reset();
  }

  show(context: CanvasRenderingContext2D, colors: GameColors) {
    context.fillStyle = colors.foreground;
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.globalAlpha = 0.35;
    context.fillStyle = colors.background;
    context.fillRect(this.x - 4, this.y - 5, 4, 3);
    context.restore();
  }

  move(frameScale: number) {
    this.x += this.xSpeed * frameScale;
    this.y += this.ySpeed * frameScale;
  }

  checkEdges() {
    if (this.x <= this.radius || this.x >= CANVAS_WIDTH - this.radius) {
      this.x = uncheckedClamp(this.radius, CANVAS_WIDTH - this.radius, this.x);
      this.xSpeed *= -1;
      this.playBounceSound();
    }

    if (this.y <= this.radius) {
      this.y = this.radius;
      this.ySpeed = Math.abs(this.ySpeed);
      this.playBounceSound();
    }

    if (this.y - this.radius > CANVAS_HEIGHT) {
      this.state.enableGame = false;
      if (this.state.enableSounds) {
        void playSound(this.state.soundGameOver);
      }
      this.reset();
    }
  }

  checkPaddle(paddle: Paddle) {
    if (
      this.ySpeed <= 0 ||
      this.y + this.radius < paddle.y ||
      this.y - this.radius > paddle.y + paddle.height ||
      this.x < paddle.x ||
      this.x > paddle.x + paddle.width
    ) {
      return;
    }

    const hit = uncheckedClamp(
      -1,
      1,
      (this.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2)
    );
    this.y = paddle.y - this.radius;
    this.xSpeed = hit * BALL_SPEED * 0.85;
    this.ySpeed = -Math.sqrt(BALL_SPEED ** 2 - this.xSpeed ** 2);
    this.playBounceSound();
  }

  checkBricks() {
    let collision: Brick | undefined;

    for (let index = this.state.bricks.length - 1; index >= 0; index -= 1) {
      const brick = this.state.bricks[index];
      if (!this.overlaps(brick)) {
        continue;
      }

      collision ??= brick;
      this.state.bricks.splice(index, 1);
      this.state.score += BRICK_SCORE;
      if (this.state.enableSounds) {
        void playSound(this.state.soundBreak);
      }
    }

    if (collision) {
      this.bounceFrom(collision);
    }
    if (this.state.bricks.length === 0) {
      this.state.enableGame = false;
    }
  }

  reset() {
    const direction = Math.random() < 0.5 ? -1 : 1;
    const horizontalSpeed = (2.5 + Math.random() * 2.5) * direction;

    this.x = CANVAS_WIDTH / 2;
    this.y = PADDLE_Y - 56;
    this.xSpeed = horizontalSpeed;
    this.ySpeed = -Math.sqrt(BALL_SPEED ** 2 - horizontalSpeed ** 2);
  }

  private overlaps(brick: Brick) {
    return (
      this.x + this.radius > brick.x &&
      this.x - this.radius < brick.x + brick.w &&
      this.y + this.radius > brick.y &&
      this.y - this.radius < brick.y + brick.h
    );
  }

  private bounceFrom(brick: Brick) {
    const horizontalOverlap = Math.min(
      this.x + this.radius - brick.x,
      brick.x + brick.w - (this.x - this.radius)
    );
    const verticalOverlap = Math.min(
      this.y + this.radius - brick.y,
      brick.y + brick.h - (this.y - this.radius)
    );

    if (horizontalOverlap < verticalOverlap) {
      this.xSpeed *= -1;
    } else {
      this.ySpeed *= -1;
    }
  }

  private playBounceSound() {
    if (this.state.enableSounds) {
      void playSound(this.state.soundBounce);
    }
  }
}
