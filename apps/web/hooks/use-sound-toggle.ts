"use client";

import { defineSound } from "@web-kits/audio";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

import * as audio from "@/audio/core";

const soundEnabledAtom = atomWithStorage("sound-enabled", false);

export const useSoundEnabled = () => useAtom(soundEnabledAtom);

export const useSoundToggle = () => {
  const [soundEnabled, setSoundEnabled] = useAtom(soundEnabledAtom);

  const toggleSound = useCallback(() => {
    if (soundEnabled) {
      defineSound(audio._patch.sounds["toggle-off"])();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      defineSound(audio._patch.sounds["toggle-on"])();
    }
  }, [soundEnabled, setSoundEnabled]);

  useHotkeys(
    "s",
    () => toggleSound(),
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [toggleSound]
  );

  return { soundEnabled, toggleSound };
};
