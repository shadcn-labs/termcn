export interface GameColors {
  background: string;
  foreground: string;
  mutedForeground: string;
}

const readColor = (variable: string, fallback: string) => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  return value || fallback;
};

export const loadColors = (): GameColors => ({
  background: readColor("--background", "#ffffff"),
  foreground: readColor("--foreground", "#171717"),
  mutedForeground: readColor("--muted-foreground", "#737373"),
});
