import { getLogoMarkSVG } from "@/components/logo";

import { LOGO_COLUMNS, LOGO_ROWS } from "./constants";

const SHADCN_LABS_FALLBACK = [
  "..X.....X..",
  ".X..XXX..X.",
  "X..X......X",
  "X..X......X",
  "X...XXX...X",
  "X.....X...X",
  "X.....X...X",
  "X..X..X...X",
  ".X..XXX..X.",
  "..X.....X..",
];

const sampleLogo = async () => {
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    getLogoMarkSVG("#000000")
  )}`;
  await image.decode();

  const sample = document.createElement("canvas");
  sample.width = LOGO_COLUMNS;
  sample.height = LOGO_ROWS;

  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return SHADCN_LABS_FALLBACK;
  }

  context.drawImage(image, 0, 0, LOGO_COLUMNS, LOGO_ROWS);
  const pixels = context.getImageData(0, 0, LOGO_COLUMNS, LOGO_ROWS).data;

  return Array.from({ length: LOGO_ROWS }, (_rowValue, row) =>
    Array.from({ length: LOGO_COLUMNS }, (_columnValue, column) => {
      const alpha = pixels[(row * LOGO_COLUMNS + column) * 4 + 3];
      return alpha > 48 ? "X" : ".";
    }).join("")
  );
};

export const loadLogoPattern = async () => {
  try {
    const pattern = await sampleLogo();
    const brickCount = pattern.join("").replaceAll(".", "").length;
    return brickCount > 20 ? pattern : SHADCN_LABS_FALLBACK;
  } catch {
    return SHADCN_LABS_FALLBACK;
  }
};
