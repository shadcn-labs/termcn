import { Box, Text } from "ink";
import React from "react";

import { useTheme } from "@/hooks/use-theme";
import { useUnicode } from "@/hooks/use-unicode";
import type { VisualAccessibilityProps } from "@/registry/bases/ink/lib/accessibility";

interface QRCodeBaseProps {
  value: string;
  size?: "sm" | "md" | "lg";
  color?: string;
  label?: string;
}

export type QRCodeProps = QRCodeBaseProps & VisualAccessibilityProps;

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x1_00) {
      x ^= 0x1_1d;
    }
  }
  for (let i = 255; i < 512; i += 1) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

const gfMul = (a: number, b: number): number => {
  if (a === 0 || b === 0) {
    return 0;
  }
  return GF_EXP[(GF_LOG[a] + GF_LOG[b]) % 255] ?? 0;
};

const gfPoly = (degree: number): Uint8Array => {
  let p = new Uint8Array([1]);
  for (let i = 0; i < degree; i += 1) {
    const q = new Uint8Array(p.length + 1);
    const alpha = GF_EXP[i];
    for (let j = 0; j < p.length; j += 1) {
      q[j] ^= p[j];
      q[j + 1] ^= gfMul(p[j], alpha);
    }
    p = q;
  }
  return p;
};

const rsEncode = (data: Uint8Array, ecCount: number): Uint8Array => {
  const gen = gfPoly(ecCount);
  const msg = new Uint8Array(data.length + ecCount);
  msg.set(data);
  for (let i = 0; i < data.length; i += 1) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 1; j <= ecCount; j += 1) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
};

const VERSION = 1;
const SIZE = 17 + VERSION * 4;
const DATA_CODEWORDS = 14;
const EC_CODEWORDS = 10;

const encodeData = (text: string): Uint8Array => {
  const ALNUM_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";

  const isNumeric = /^[0-9]*$/.test(text);
  const isAlphanumeric = [...text].every((c) => ALNUM_CHARS.includes(c));

  const bits: number[] = [];

  const pushBits = (value: number, count: number) => {
    for (let i = count - 1; i >= 0; i -= 1) {
      bits.push((value >> i) & 1);
    }
  };

  if (isNumeric) {
    pushBits(0b0001, 4);
    pushBits(text.length, 10);
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3);
      const val = Number.parseInt(group, 10);
      let bitCount = 4;
      if (group.length === 3) {
        bitCount = 10;
      } else if (group.length === 2) {
        bitCount = 7;
      }
      pushBits(val, bitCount);
    }
  } else if (isAlphanumeric) {
    pushBits(0b0010, 4);
    pushBits(text.length, 9);
    for (let i = 0; i < text.length; i += 2) {
      if (i + 1 < text.length) {
        const v =
          ALNUM_CHARS.indexOf(text[i]) * 45 +
          ALNUM_CHARS.indexOf(text[i + 1] ?? "");
        pushBits(v, 11);
      } else {
        pushBits(ALNUM_CHARS.indexOf(text[i]), 6);
      }
    }
  } else {
    const bytes = [...text].map((c) => (c.codePointAt(0) ?? 0) & 0xff);
    pushBits(0b0100, 4);
    pushBits(bytes.length, 8);
    for (const b of bytes) {
      pushBits(b, 8);
    }
  }

  for (let i = 0; i < 4 && bits.length < DATA_CODEWORDS * 8; i += 1) {
    bits.push(0);
  }

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < DATA_CODEWORDS * 8) {
    const b = padBytes[(padIdx += 1 % 2)] ?? 0;
    pushBits(b, 8);
  }

  const codewords = new Uint8Array(DATA_CODEWORDS);
  for (let i = 0; i < DATA_CODEWORDS; i += 1) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) {
      byte = (byte << 1) | (bits[i * 8 + j] ?? 0);
    }
    codewords[i] = byte;
  }
  return codewords;
};

type Matrix = boolean[][];

const makeMatrix = (): Matrix =>
  Array.from({ length: SIZE }, () =>
    Array.from<boolean>({ length: SIZE }).fill(false)
  );

const placeFinderPattern = (matrix: Matrix, row: number, col: number) => {
  const finder = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ];
  for (let r = 0; r < 7; r += 1) {
    for (let c = 0; c < 7; c += 1) {
      const mr = row + r;
      const mc = col + c;
      if (mr >= 0 && mr < SIZE && mc >= 0 && mc < SIZE) {
        matrix[mr][mc] = finder[r][c] === 1;
      }
    }
  }
};

const placeTimingPatterns = (matrix: Matrix) => {
  for (let i = 8; i < SIZE - 8; i += 1) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
};

const placeDarkModule = (matrix: Matrix) => {
  const row = matrix[SIZE - 8];
  if (row) {
    row[8] = true;
  }
};

const buildFunctionMask = (_matrix: Matrix): boolean[][] => {
  const mask = makeMatrix();

  const setRegion = (r: number, c: number, h: number, w: number) => {
    for (let dr = 0; dr < h; dr += 1) {
      for (let dc = 0; dc < w; dc += 1) {
        if (r + dr >= 0 && r + dr < SIZE && c + dc >= 0 && c + dc < SIZE) {
          const maskRow = mask[r + dr];
          if (maskRow) {
            maskRow[c + dc] = true;
          }
        }
      }
    }
  };

  setRegion(0, 0, 8, 8);
  setRegion(0, SIZE - 8, 8, 8);
  setRegion(SIZE - 8, 0, 8, 8);

  for (let i = 0; i < SIZE; i += 1) {
    mask[6][i] = true;
    mask[i][6] = true;
  }

  for (let i = 0; i < 9; i += 1) {
    mask[i][8] = true;
    mask[8][i] = true;
  }
  for (let i = SIZE - 8; i < SIZE; i += 1) {
    mask[8][i] = true;
    mask[i][8] = true;
  }

  return mask;
};

const FORMAT_STRINGS: Record<number, number> = {
  0: 0b101_0100_0001_0010,
  1: 0b101_0001_0010_0101,
  2: 0b101_1110_0111_1100,
  3: 0b101_1011_0100_1011,
  4: 0b100_0101_1111_1001,
  5: 0b100_0000_1100_1110,
  6: 0b100_1111_1001_0111,
  7: 0b100_1010_1010_0000,
};

const placeFormatInfo = (matrix: Matrix, maskPattern: number) => {
  const fmt = FORMAT_STRINGS[maskPattern] ?? FORMAT_STRINGS[0];

  const bits15 = Array.from({ length: 15 }, (_, i) => (fmt >> (14 - i)) & 1);
  const positions = [
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [7, 8],
    [8, 8],
    [8, 7],
    [8, 5],
    [8, 4],
    [8, 3],
    [8, 2],
    [8, 1],
    [8, 0],
  ];
  for (let i = 0; i < positions.length; i += 1) {
    const pos = positions[i];
    if (pos) {
      const matrixRow = matrix[pos[0]];
      if (matrixRow) {
        matrixRow[pos[1]] = (bits15[i] ?? 0) === 1;
      }
    }
  }

  const positions2 = [
    [8, SIZE - 1],
    [8, SIZE - 2],
    [8, SIZE - 3],
    [8, SIZE - 4],
    [8, SIZE - 5],
    [8, SIZE - 6],
    [8, SIZE - 7],
    [8, SIZE - 8],
  ];
  for (let i = 0; i < positions2.length; i += 1) {
    const pos = positions2[i];
    if (pos) {
      const matrixRow = matrix[pos[0]];
      if (matrixRow) {
        matrixRow[pos[1]] = (bits15[i] ?? 0) === 1;
      }
    }
  }

  const positions3 = [
    [SIZE - 7, 8],
    [SIZE - 6, 8],
    [SIZE - 5, 8],
    [SIZE - 4, 8],
    [SIZE - 3, 8],
    [SIZE - 2, 8],
    [SIZE - 1, 8],
  ];
  for (let i = 0; i < positions3.length; i += 1) {
    const pos = positions3[i];
    if (pos) {
      const matrixRow = matrix[pos[0]];
      if (matrixRow) {
        matrixRow[pos[1]] = (bits15[8 + i] ?? 0) === 1;
      }
    }
  }
};

const placeData = (matrix: Matrix, funcMask: boolean[][], bits: number[]) => {
  let idx = 0;
  let goingUp = true;
  for (let col = SIZE - 1; col >= 1; col -= 2) {
    if (col === 6) {
      col = 5;
    }
    for (let rowStep = 0; rowStep < SIZE; rowStep += 1) {
      const row = goingUp ? SIZE - 1 - rowStep : rowStep;
      for (let dc = 0; dc <= 1; dc += 1) {
        const c = col - dc;
        if (funcMask[row][c]) {
          continue;
        }
        matrix[row][c] = (bits[idx] ?? 0) === 1;
        idx += 1;
      }
    }
    goingUp = !goingUp;
  }
};

const applyMask = (matrix: Matrix, funcMask: boolean[][], pattern: number) => {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (funcMask[r][c]) {
        continue;
      }
      let invert = false;
      switch (pattern) {
        case 0: {
          invert = (r + c) % 2 === 0;
          break;
        }
        case 1: {
          invert = r % 2 === 0;
          break;
        }
        case 2: {
          invert = c % 3 === 0;
          break;
        }
        case 3: {
          invert = (r + c) % 3 === 0;
          break;
        }
        case 4: {
          invert = (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0;
          break;
        }
        case 5: {
          invert = ((r * c) % 2) + ((r * c) % 3) === 0;
          break;
        }
        case 6: {
          invert = (((r * c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        }
        case 7: {
          invert = (((r + c) % 2) + ((r * c) % 3)) % 2 === 0;
          break;
        }
        default: {
          break;
        }
      }
      if (invert) {
        matrix[r][c] = !matrix[r][c];
      }
    }
  }
};

const scorePenalty = (matrix: Matrix): number => {
  let penalty = 0;

  for (let r = 0; r < SIZE; r += 1) {
    for (const isRow of [true, false]) {
      let run = 1;
      for (let i = 1; i < SIZE; i += 1) {
        const prev = isRow ? matrix[r]?.[i - 1] : matrix[i - 1]?.[r];
        const cur = isRow ? matrix[r][i] : matrix[i][r];
        if (cur === prev) {
          run += 1;
          if (run === 5) {
            penalty += 3;
          } else if (run > 5) {
            penalty += 1;
          }
        } else {
          run = 1;
        }
      }
    }
  }

  for (let r = 0; r < SIZE - 1; r += 1) {
    for (let c = 0; c < SIZE - 1; c += 1) {
      const v = matrix[r][c];
      if (
        v === matrix[r]?.[c + 1] &&
        v === matrix[r + 1]?.[c] &&
        v === matrix[r + 1]?.[c + 1]
      ) {
        penalty += 3;
      }
    }
  }

  return penalty;
};

const generateQR = (text: string): Matrix => {
  const capped = text.slice(0, 17);

  const dataBytes = encodeData(capped);
  const ecBytes = rsEncode(dataBytes, EC_CODEWORDS);

  const allBytes = new Uint8Array([...dataBytes, ...ecBytes]);
  const bits: number[] = [];
  for (const b of allBytes) {
    for (let i = 7; i >= 0; i -= 1) {
      bits.push((b >> i) & 1);
    }
  }

  let bestMatrix: Matrix | null = null;
  let bestPenalty = Infinity;

  for (let maskPattern = 0; maskPattern < 8; maskPattern += 1) {
    const matrix = makeMatrix();
    placeFinderPattern(matrix, 0, 0);
    placeFinderPattern(matrix, 0, SIZE - 7);
    placeFinderPattern(matrix, SIZE - 7, 0);
    placeTimingPatterns(matrix);
    placeDarkModule(matrix);

    const funcMask = buildFunctionMask(matrix);
    placeData(matrix, funcMask, bits);
    applyMask(matrix, funcMask, maskPattern);
    placeFormatInfo(matrix, maskPattern);

    const p = scorePenalty(matrix);
    if (p < bestPenalty) {
      bestPenalty = p;
      bestMatrix = matrix;
    }
  }

  return bestMatrix ?? makeMatrix();
};

const QUIET_ZONE = 2;

export const QRCode = ({
  value,
  size = "md",
  color,
  label,
  alt,
  "aria-hidden": ariaHidden,
}: QRCodeProps) => {
  const theme = useTheme();
  const unicode = useUnicode();
  const resolvedColor = color ?? theme.colors.foreground;

  let matrix: Matrix;
  try {
    matrix = generateQR(value);
  } catch {
    return (
      <Box
        flexDirection="column"
        gap={0}
        aria-hidden={ariaHidden}
        aria-label={ariaHidden ? undefined : `QR code: ${alt}`}
      >
        <Text color="red">QR Error: value too long or unsupported</Text>
        {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      </Box>
    );
  }

  const qzMatrix: Matrix = [];
  const totalSize = SIZE + QUIET_ZONE * 2;
  for (let r = 0; r < totalSize; r += 1) {
    const row: boolean[] = Array.from<boolean>({ length: totalSize }).fill(
      false
    );
    if (r >= QUIET_ZONE && r < SIZE + QUIET_ZONE) {
      for (let c = 0; c < SIZE; c += 1) {
        row[c + QUIET_ZONE] = matrix[r - QUIET_ZONE]?.[c] ?? false;
      }
    }
    qzMatrix.push(row);
  }

  const scale = size === "lg" ? 2 : 1;
  const darkCell = unicode ? "█" : "##";
  const lightCell = unicode ? " " : "  ";

  if (size === "sm" && unicode) {
    const lines: React.ReactElement[] = [];
    for (let r = 0; r < totalSize; r += 2) {
      const chars: string[] = [];
      for (let c = 0; c < totalSize; c += 1) {
        const top = qzMatrix[r][c] ?? false;
        const bottom = qzMatrix[r + 1]?.[c] ?? false;
        if (top && bottom) {
          chars.push("█");
        } else if (top) {
          chars.push("▀");
        } else if (bottom) {
          chars.push("▄");
        } else {
          chars.push(" ");
        }
      }
      lines.push(
        <Text key={r} color={resolvedColor}>
          {chars.join("")}
        </Text>
      );
    }
    return (
      <Box
        flexDirection="column"
        gap={0}
        aria-hidden={ariaHidden}
        aria-label={ariaHidden ? undefined : `QR code: ${alt}`}
      >
        {lines}
        {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
      </Box>
    );
  }

  const lines: React.ReactElement[] = [];
  for (let r = 0; r < totalSize; r += 1) {
    const chars: string[] = [];
    for (let c = 0; c < totalSize; c += 1) {
      const on = qzMatrix[r][c] ?? false;
      chars.push((on ? darkCell : lightCell).repeat(scale));
    }
    for (let s = 0; s < scale; s += 1) {
      lines.push(
        <Text key={`${r}-${s}`} color={resolvedColor}>
          {chars.join("")}
        </Text>
      );
    }
  }

  return (
    <Box
      flexDirection="column"
      gap={0}
      aria-hidden={ariaHidden}
      aria-label={ariaHidden ? undefined : `QR code: ${alt}`}
    >
      {lines}
      {label && <Text color={theme.colors.mutedForeground}>{label}</Text>}
    </Box>
  );
};
