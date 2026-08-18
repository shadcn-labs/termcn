export type VisualAccessibilityProps =
  | { "aria-hidden": true; alt?: never }
  | { "aria-hidden"?: false; alt: string };

export interface AccessibleSeriesPoint {
  label?: string;
  value: number;
}

export const summarizeSeries = (
  label: string,
  points: readonly AccessibleSeriesPoint[],
  maximumPoints = 5
): string => {
  if (points.length === 0) {
    return `${label}: no data`;
  }

  const values = points.map(({ value }) => value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const current = values.at(-1) ?? 0;
  const first = values[0] ?? current;
  let trend = "flat";
  if (current > first) {
    trend = "increasing";
  } else if (current < first) {
    trend = "decreasing";
  }
  const samples = points
    .slice(0, Math.max(0, maximumPoints))
    .map((point, index) => `${point.label ?? index + 1}: ${point.value}`)
    .join(", ");
  const omitted = Math.max(0, points.length - maximumPoints);

  return `${label}. Current ${current}. Range ${minimum} to ${maximum}. Trend ${trend}.${
    samples
      ? ` Values: ${samples}${omitted > 0 ? `, and ${omitted} more` : ""}.`
      : ""
  }`;
};
