import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const hapticsEnabledAtom = atomWithStorage("haptics-enabled", false);

export const useHapticsEnabled = () => useAtom(hapticsEnabledAtom);
