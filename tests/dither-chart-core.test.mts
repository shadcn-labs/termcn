import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { renderDitherAreaChart as renderInkArea } from "../registry/bases/ink/lib/dither-area-chart-utils.ts";
import { renderDitherBarChart as renderInkBar } from "../registry/bases/ink/lib/dither-bar-chart-utils.ts";
import type {
  ChartType,
  DitherChartRenderer,
  DitherRenderInput,
  SeriesSpec,
} from "../registry/bases/ink/lib/dither-chart-utils.ts";
import { renderDitherLineChart as renderInkLine } from "../registry/bases/ink/lib/dither-line-chart-utils.ts";
import { renderDitherPieChart as renderInkPie } from "../registry/bases/ink/lib/dither-pie-chart-utils.ts";
import { renderDitherRadarChart as renderInkRadar } from "../registry/bases/ink/lib/dither-radar-chart-utils.ts";
import { renderDitherAreaChart as renderOpenTUIArea } from "../registry/bases/opentui/lib/dither-area-chart-utils.ts";
import { renderDitherBarChart as renderOpenTUIBar } from "../registry/bases/opentui/lib/dither-bar-chart-utils.ts";
import { renderDitherLineChart as renderOpenTUILine } from "../registry/bases/opentui/lib/dither-line-chart-utils.ts";
import { renderDitherPieChart as renderOpenTUIPie } from "../registry/bases/opentui/lib/dither-pie-chart-utils.ts";
import { renderDitherRadarChart as renderOpenTUIRadar } from "../registry/bases/opentui/lib/dither-radar-chart-utils.ts";

const inkRenderers: Record<ChartType, DitherChartRenderer> = {
  area: renderInkArea,
  bar: renderInkBar,
  line: renderInkLine,
  pie: renderInkPie,
  radar: renderInkRadar,
};

const openTuiRenderers: Record<ChartType, DitherChartRenderer> = {
  area: renderOpenTUIArea,
  bar: renderOpenTUIBar,
  line: renderOpenTUILine,
  pie: renderOpenTUIPie,
  radar: renderOpenTUIRadar,
};

const renderInk: DitherChartRenderer = (input) =>
  inkRenderers[input.kind](input);

const renderOpenTUI: DitherChartRenderer = (input) =>
  openTuiRenderers[input.kind](input);

const data = [
  { desktop: 20, mobile: 12, month: "Jan" },
  { desktop: 38, mobile: 24, month: "Feb" },
  { desktop: 31, mobile: 30, month: "Mar" },
  { desktop: 52, mobile: 35, month: "Apr" },
];

const config = {
  desktop: { color: "blue" as const, label: "Desktop" },
  mobile: { color: "pink" as const, label: "Mobile" },
};

const series: SeriesSpec[] = [
  {
    activeDot: { radius: 3, variant: "filled" },
    dataKey: "desktop",
    dot: { radius: 2, variant: "colored-border" },
    isClickable: true,
    kind: "area",
    strokeVariant: "solid",
    variant: "gradient",
  },
  {
    dataKey: "mobile",
    isClickable: true,
    kind: "area",
    strokeVariant: "dashed",
    variant: "dotted",
  },
];

const cartesian = (
  overrides: Partial<DitherRenderInput> = {}
): DitherRenderInput => ({
  bloom: "low",
  bloomOnHover: false,
  config,
  data,
  focusDataKey: null,
  grid: { horizontal: true, strokeDasharray: "3 3", vertical: true },
  height: 12,
  hovered: false,
  kind: "area",
  markerIndex: 2,
  progress: 1,
  selectedDataKey: null,
  series,
  stackType: "default",
  unicode: true,
  width: 48,
  xAxis: { dataKey: "month", maxTicks: 4 },
  yAxis: { tickCount: 4 },
  ...overrides,
});

const textOf = (input: DitherRenderInput): string =>
  renderInk(input)
    .frame.map((row) => row.map((cell) => cell.char).join(""))
    .join("\n");

test("Ink and OpenTUI use byte-for-byte equivalent cell geometry", () => {
  const cases: DitherRenderInput[] = [
    cartesian(),
    cartesian({
      kind: "line",
      series: series.map((item) => ({ ...item, kind: "line" })),
    }),
    cartesian({
      kind: "bar",
      series: series.map((item) => ({ ...item, kind: "bar" })),
      stackType: "stacked",
    }),
    cartesian({
      config: {
        alpha: { color: "green" },
        beta: { color: "orange" },
        gamma: { color: "purple" },
      },
      data: [
        { name: "alpha", value: 4 },
        { name: "beta", value: 3 },
        { name: "gamma", value: 5 },
      ],
      kind: "pie",
      nameKey: "name",
      pie: { innerRadius: 0.45, valueKey: "value", variant: "gradient" },
      series: [],
      xAxis: undefined,
      yAxis: undefined,
    }),
    cartesian({
      data: [
        { desktop: 8, mobile: 6, name: "Speed" },
        { desktop: 6, mobile: 9, name: "Quality" },
        { desktop: 9, mobile: 5, name: "Reach" },
        { desktop: 7, mobile: 8, name: "Value" },
      ],
      kind: "radar",
      nameKey: "name",
      series: series.map((item) => ({ ...item, kind: "radar" })),
      xAxis: undefined,
      yAxis: undefined,
    }),
  ];

  for (const input of cases) {
    assert.deepEqual(renderInk(input), renderOpenTUI(input));
  }
});

test("percent stacks normalize to one and preserve the requested frame", () => {
  const result = renderInk(cartesian({ stackType: "percent" }));
  assert.equal(result.max, 1);
  assert.equal(result.frame.length, 12);
  assert.ok(result.frame.every((row) => row.length === 48));
});

test("donut radius leaves the center cell empty", () => {
  const input = cartesian({
    config: {
      alpha: { color: "green" },
      beta: { color: "orange" },
    },
    data: [
      { name: "alpha", value: 4 },
      { name: "beta", value: 6 },
    ],
    kind: "pie",
    nameKey: "name",
    pie: { innerRadius: 0.55, valueKey: "value", variant: "solid" },
    series: [],
    xAxis: undefined,
    yAxis: undefined,
  });
  const result = renderInk(input);
  assert.equal(
    result.frame[Math.floor(input.height / 2)]?.[Math.floor(input.width / 2)]
      ?.char,
    " "
  );
});

test("ASCII mode removes Unicode drawing glyphs without erasing the chart", () => {
  const output = textOf(cartesian({ unicode: false }));
  assert.doesNotMatch(output, /[█▓▒░•·✦◉○┄┊─┤]/u);
  assert.match(output, /[#+:.*|-]/u);
});

test("OpenTUI chart rows keep modifiers inside one text host", async () => {
  const source = await readFile(
    new URL("../registry/bases/opentui/ui/dither-chart.tsx", import.meta.url),
    "utf-8"
  );

  assert.doesNotMatch(source, /<dim>/u);
  assert.equal(source.includes("<StyledText key={`dither-row-"), false);
  assert.equal(source.includes("<text key={`dither-row-"), true);
  assert.match(source, /<span/u);
});

test("chart previews reserve stable rows and scroll OpenTUI overflow", async () => {
  const [openTuiPreview, terminalPreview, inkAreaDocs, inkPieDocs] =
    await Promise.all([
      readFile(
        new URL("../components/opentui-preview.tsx", import.meta.url),
        "utf-8"
      ),
      readFile(
        new URL("../components/terminal-preview.tsx", import.meta.url),
        "utf-8"
      ),
      readFile(
        new URL(
          "../content/docs/components/ink/charts/dither-area-chart.mdx",
          import.meta.url
        ),
        "utf-8"
      ),
      readFile(
        new URL(
          "../content/docs/components/ink/charts/dither-pie-chart.mdx",
          import.meta.url
        ),
        "utf-8"
      ),
    ]);

  assert.match(openTuiPreview, /<scrollbox[^>]*scrollX[^>]*scrollY>/u);
  assert.match(openTuiPreview, /fallbackRows=\{rows\}/u);
  assert.match(terminalPreview, /<OpenTuiPreview rows=\{rows\}/u);
  assert.match(terminalPreview, /<InkPreview rows=\{rows\}/u);
  assert.match(inkAreaDocs, /rows=\{22\}/u);
  assert.match(inkPieDocs, /rows=\{21\}/u);
});

test("published chart entries install only their shared and chart-specific layers", async () => {
  const charts = [
    "dither-area-chart",
    "dither-bar-chart",
    "dither-line-chart",
    "dither-pie-chart",
    "dither-radar-chart",
    "dither-sparkline",
  ];
  const cases = charts.flatMap((chart) =>
    ["ink", "opentui"].map((base) => ({ base, chart }))
  );
  const manifests = await Promise.all(
    cases.map(({ base, chart }) =>
      readFile(
        new URL(`../public/r/${base}/${chart}.json`, import.meta.url),
        "utf-8"
      )
    )
  );

  for (let index = 0; index < manifests.length; index += 1) {
    const manifest = manifests[index] ?? "";
    const chart = cases[index]?.chart ?? "";
    assert.match(manifest, /"target": "lib\/dither-chart-utils\.ts"/u);
    assert.ok(
      manifest.includes(`"target": "lib/${chart}-utils.ts"`),
      `${chart} should install its own renderer utility`
    );
    for (const other of charts.filter((name) => name !== chart)) {
      assert.equal(
        manifest.includes(`"target": "lib/${other}-utils.ts"`),
        false,
        `${chart} should not install ${other}'s renderer utility`
      );
    }
    assert.match(manifest, /from \\"@\/lib\/dither-chart-utils\\"/u);
    assert.doesNotMatch(manifest, /dither-chart-core/u);
  }
});

test("shared chart surfaces do not contain chart-specific component exports", async () => {
  const sources = await Promise.all(
    ["ink", "opentui"].map((base) =>
      readFile(
        new URL(
          `../registry/bases/${base}/ui/dither-chart.tsx`,
          import.meta.url
        ),
        "utf-8"
      )
    )
  );

  for (const source of sources) {
    assert.match(source, /export const DitherChart/u);
    assert.doesNotMatch(
      source,
      /export function (AreaChart|BarChart|LineChart|PieChart|RadarChart|Sparkline)/u
    );
  }
});
