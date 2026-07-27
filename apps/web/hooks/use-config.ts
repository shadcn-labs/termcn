import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type InstallationType = "cli" | "manual";

export interface Config {
  installationType: InstallationType;
}

const configAtom = atomWithStorage<Config>("config", {
  installationType: "cli",
});

export const useConfig = () => useAtom(configAtom);
