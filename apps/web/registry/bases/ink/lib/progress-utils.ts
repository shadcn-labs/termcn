export const getProgressPercent = (value: number, total?: number): number => {
  let rawPercent = value;
  if (total !== undefined) {
    rawPercent = total > 0 ? (value / total) * 100 : 0;
  }

  if (!Number.isFinite(rawPercent)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(rawPercent)));
};
