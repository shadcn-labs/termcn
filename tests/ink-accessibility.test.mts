import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { cleanup, render } from "ink-testing-library";
import React from "react";

import { BarChart } from "../registry/bases/ink/ui/bar-chart.tsx";
import { QRCode } from "../registry/bases/ink/ui/qr-code.tsx";
import { Skeleton } from "../registry/bases/ink/ui/skeleton.tsx";
import { TextInput } from "../registry/bases/ink/ui/text-input.tsx";

const settle = () => delay(25);

test.before(() => {
  process.env.INK_SCREEN_READER = "true";
});
test.after(() => {
  delete process.env.INK_SCREEN_READER;
});
test.afterEach(() => cleanup());

test("visual loading output becomes one semantic status", async () => {
  const instance = render(
    React.createElement(Skeleton, { "aria-label": "Loading projects" })
  );
  await settle();
  const output = instance.lastFrame() ?? "";
  assert.match(output, /Loading projects/);
  assert.doesNotMatch(output, /[█░]/);
  const frameCount = instance.frames.length;
  await settle();
  assert.equal(instance.frames.length, frameCount);
});

test("QR code and charts expose text instead of plot glyphs", async () => {
  const qr = render(
    React.createElement(QRCode, {
      alt: "Open the project website",
      value: "https://termcn.dev",
    })
  );
  await settle();
  assert.match(qr.lastFrame() ?? "", /QR code: Open the project website/);
  assert.doesNotMatch(qr.lastFrame() ?? "", /█/);
  qr.unmount();

  const chart = render(
    React.createElement(BarChart, {
      data: [
        { label: "Current", value: 8 },
        { label: "Previous", value: 4 },
      ],
      title: "Requests",
    })
  );
  await settle();
  const output = chart.lastFrame() ?? "";
  assert.match(output, /Requests/);
  assert.match(output, /Current: 8/);
  assert.doesNotMatch(output, /[█░]/);
});

test("textbox output includes native role and state descriptions", async () => {
  const instance = render(
    React.createElement(TextInput, {
      "aria-label": "Project name",
      disabled: true,
      required: true,
      value: "Termcn",
    })
  );
  await settle();
  const output = instance.lastFrame() ?? "";
  assert.match(output, /Project name/);
  assert.match(output, /textbox/i);
  assert.match(output, /disabled/i);
  assert.match(output, /required/i);
  assert.doesNotMatch(output, /[█▌]/);
});
