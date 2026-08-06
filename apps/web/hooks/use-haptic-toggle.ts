"use client";

import { defineSound } from "@web-kits/audio";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useWebHaptics } from "web-haptics/react";

import * as audio from "@/audio/core";
import { useSoundEnabled } from "@/hooks/use-sound-toggle";

const hapticsEnabledAtom = atomWithStorage("haptics-enabled", false);

export const useHapticsEnabled = () => useAtom(hapticsEnabledAtom);

export const useHapticsToggle = () => {
  const [hapticsEnabled, setHapticsEnabled] = useAtom(hapticsEnabledAtom);
  const [soundEnabled] = useSoundEnabled();
  const { trigger: hapticTrigger } = useWebHaptics();

  const toggleHaptics = useCallback(() => {
    if (hapticsEnabled) {
      if (soundEnabled) {
        defineSound(audio._patch.sounds["toggle-off"])();
      }
      void hapticTrigger("light");
      setHapticsEnabled(false);
    } else {
      setHapticsEnabled(true);
      if (soundEnabled) {
        defineSound(audio._patch.sounds["toggle-on"])();
      }
      void hapticTrigger("light");
    }
  }, [hapticsEnabled, setHapticsEnabled, soundEnabled, hapticTrigger]);

  useHotkeys(
    "h",
    () => toggleHaptics(),
    {
      enableOnContentEditable: true,
      enableOnFormTags: true,
      preventDefault: true,
    },
    [toggleHaptics]
  );

  return { hapticsEnabled, toggleHaptics };
};
