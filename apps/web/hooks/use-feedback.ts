"use client";

import type { SoundDefinition } from "@web-kits/audio";
import { defineSound } from "@web-kits/audio";
import { useCallback } from "react";
import { useWebHaptics } from "web-haptics/react";

import * as audio from "@/audio/core";
import { useHapticsEnabled } from "@/hooks/use-haptic-toggle";
import { useSoundEnabled } from "@/hooks/use-sound-toggle";

type PatchSoundKey = keyof typeof audio._patch.sounds;
type KebabToCamel<K extends string> = K extends `${infer A}-${infer B}`
  ? `${A}${Capitalize<KebabToCamel<B>>}`
  : K;

export type FeedbackType = {
  [K in PatchSoundKey]: KebabToCamel<K>;
}[PatchSoundKey];

const toFeedbackKey = (k: string): FeedbackType =>
  k.replaceAll(/-([a-z])/g, (_, c: string) => c.toUpperCase()) as FeedbackType;

const patchKeyByFeedback = Object.fromEntries(
  (Object.keys(audio._patch.sounds) as PatchSoundKey[]).map((k) => [
    toFeedbackKey(k),
    k,
  ])
) as Record<FeedbackType, PatchSoundKey>;

const hapticPresetByType: Partial<Record<FeedbackType, string>> = {
  blur: "light",
  checkbox: "light",
  click: "medium",
  copy: "selection",
  deselect: "light",
  error: "error",
  focus: "light",
  heart: "light",
  hover: "soft",
  keyPress: "light",
  notification: "nudge",
  pop: "medium",
  radio: "medium",
  scrollSnap: "selection",
  select: "selection",
  star: "medium",
  success: "success",
  tabSwitch: "selection",
  tap: "light",
  tick: "selection",
  toggleOff: "light",
  toggleOn: "light",
  warning: "warning",
};

export interface UseFeedbackOptions {
  sound?: FeedbackType;
  soundDef?: SoundDefinition;
  haptic?: boolean;
}

export const useFeedback = ({
  sound,
  soundDef,
  haptic = true,
}: UseFeedbackOptions) => {
  const { trigger: hapticTrigger } = useWebHaptics();
  const [soundEnabled] = useSoundEnabled();
  const [hapticsEnabled] = useHapticsEnabled();

  return useCallback(() => {
    if (!sound && !soundDef) {
      return;
    }
    if (soundEnabled) {
      if (sound) {
        defineSound(audio._patch.sounds[patchKeyByFeedback[sound]])();
      } else if (soundDef) {
        defineSound(soundDef)();
      }
    }
    if (sound && haptic && hapticsEnabled) {
      void hapticTrigger(hapticPresetByType[sound] ?? "light");
    }
  }, [sound, soundDef, haptic, hapticTrigger, soundEnabled, hapticsEnabled]);
};
