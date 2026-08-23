import type { Brick } from "./brick";

export interface GameState {
  bricks: Brick[];
  enableGame: boolean;
  enableSounds: boolean;
  score: number;
  soundBounce: HTMLAudioElement;
  soundBreak: HTMLAudioElement;
  soundGameOver: HTMLAudioElement;
}
