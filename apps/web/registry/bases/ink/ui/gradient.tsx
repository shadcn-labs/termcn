import { Box, Text } from "ink";

export type GradientName =
  | "cristal"
  | "teen"
  | "mind"
  | "morning"
  | "vice"
  | "passion"
  | "fruit"
  | "instagram"
  | "atlas"
  | "retro"
  | "summer"
  | "pastel"
  | "rainbow";

const GRADIENT_PRESETS: Record<GradientName, string[]> = {
  atlas: ["#feac5e", "#c779d0", "#4bc0c8"],
  cristal: ["#bdfff3", "#4ac29a"],
  fruit: ["#ff4e50", "#f9d423"],
  instagram: ["#833ab4", "#fd1d1d", "#fcb045"],
  mind: ["#473b7b", "#3584a7", "#30d2be"],
  morning: ["#ff5f6d", "#ffc371"],
  passion: ["#f43b47", "#453a94"],
  pastel: ["#74ebd5", "#9face6"],
  rainbow: ["#ff0000", "#ff7700", "#ffff00", "#00ff00", "#0000ff", "#8b00ff"],
  retro: [
    "#3f51b1",
    "#5a55ae",
    "#7b5fac",
    "#8f6aae",
    "#a86aa4",
    "#cc6b8e",
    "#f18271",
    "#f3a469",
    "#f7c978",
  ],
  summer: ["#22c1c3", "#fdbb2d"],
  teen: ["#77a1d3", "#79cbca", "#e684ae"],
  vice: ["#5ee7df", "#b490ca"],
};

export interface GradientProps {
  children: string;
  name?: GradientName;
  colors?: string[];
  bold?: boolean;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const parseHex = (hex: string): RGB => {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3 ? [...clean].map((c) => c + c).join("") : clean;
  return {
    b: Number.parseInt(full.slice(4, 6), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    r: Number.parseInt(full.slice(0, 2), 16),
  };
};

const toHex = ({ r, g, b }: RGB): string =>
  `#${[r, g, b]
    .map((v) =>
      Math.round(Math.max(0, Math.min(255, v)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;

const lerpColor = (a: RGB, b: RGB, t: number): RGB => ({
  b: a.b + (b.b - a.b) * t,
  g: a.g + (b.g - a.g) * t,
  r: a.r + (b.r - a.r) * t,
});

export interface GradientChar {
  char: string;
  color: string;
}

export const gradientText = (
  text: string,
  colors: string[]
): GradientChar[] => {
  if (colors.length === 0) {
    return [...text].map((char) => ({ char, color: "" }));
  }
  if (colors.length === 1) {
    return [...text].map((char) => ({ char, color: colors[0] }));
  }

  const parsedColors = colors.map(parseHex);
  const segments = colors.length - 1;
  const len = text.length;

  return [...text].map((char, i) => {
    if (len <= 1) {
      return { char, color: colors[0] };
    }
    const pos = (i / (len - 1)) * segments;
    const segIndex = Math.min(Math.floor(pos), segments - 1);
    const t = pos - segIndex;
    const color = toHex(
      lerpColor(parsedColors[segIndex], parsedColors[segIndex + 1], t)
    );
    return { char, color };
  });
};

export const Gradient = ({
  children,
  name,
  colors,
  bold = false,
}: GradientProps) => {
  const resolvedColors = colors ?? (name ? GRADIENT_PRESETS[name] : []);
  const chars = gradientText(children, resolvedColors);

  return (
    <Box flexDirection="row">
      {chars.map((item, idx) => (
        <Text key={idx} color={item.color} bold={bold}>
          {item.char}
        </Text>
      ))}
    </Box>
  );
};
