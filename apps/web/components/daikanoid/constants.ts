export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const BALL_RADIUS = 10;
export const BALL_SPEED = 8;

export const PADDLE_WIDTH = 96;
export const PADDLE_HEIGHT = 20;
export const PADDLE_SPEED = 12;
export const PADDLE_Y = CANVAS_HEIGHT - PADDLE_HEIGHT - 8;

export const BRICK_SIZE = 40;
export const BRICK_SCORE = 10;

export const LOGO_COLUMNS = 11;
export const LOGO_ROWS = 10;
export const LOGO_TOP = 28;

export const SOUND_BOUNCE_URL =
  "https://assets.chanhdai.com/sounds/daikanoid/bounce.mp3";
export const SOUND_BREAK_URL =
  "https://assets.chanhdai.com/sounds/daikanoid/break.mp3";
export const SOUND_GAME_OVER_URL =
  "https://assets.chanhdai.com/sounds/daikanoid/game-over.mp3";
export const SOUND_VOLUME = 0.3;

export const uncheckedClamp = (min: number, max: number, value: number) =>
  Math.min(Math.max(value, min), max);
