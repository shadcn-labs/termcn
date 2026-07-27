import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const soundEnabledAtom = atomWithStorage("sound-enabled", false);

export const useSoundEnabled = () => useAtom(soundEnabledAtom);
