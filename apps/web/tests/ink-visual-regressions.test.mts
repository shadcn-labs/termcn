import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { Text } from "ink";
import { cleanup, render } from "ink-testing-library";
import React from "react";
import stringWidth from "string-width";
import stripAnsi from "strip-ansi";

import { AppShell } from "../registry/bases/ink/ui/app-shell.tsx";
import {
  Bar,
  BarChart,
  Grid,
  XAxis,
  YAxis,
} from "../registry/bases/ink/ui/dither-bar-chart.tsx";
import { EmbeddedTerminal } from "../registry/bases/ink/ui/embedded-terminal.tsx";
import { Markdown } from "../registry/bases/ink/ui/markdown.tsx";
import { SearchInput } from "../registry/bases/ink/ui/search-input.tsx";
import { Select } from "../registry/bases/ink/ui/select.tsx";
import { Table } from "../registry/bases/ink/ui/table.tsx";

const settle = () => delay(50);
const plainLines = (frame: string) => stripAnsi(frame).split("\n");

test.afterEach(() => cleanup());

test("table keeps its border, header, and rows on separate lines", async () => {
  const instance = render(
    React.createElement(Table, {
      columns: [
        { header: "Name", key: "name" },
        { header: "Status", key: "status" },
      ],
      data: [
        { name: "Ink", status: "ready" },
        { name: "Termcn", status: "active" },
      ],
    })
  );
  await settle();

  const frame = instance.lastFrame() ?? "";
  const lines = plainLines(frame).filter(Boolean);
  assert.ok(lines.length >= 6);
  assert.match(lines[1] ?? "", /Name/, frame);
  assert.match(lines[3] ?? "", /Ink/, frame);
  assert.match(lines[4] ?? "", /Termcn/, frame);
  assert.ok(lines.every((line) => stringWidth(line) === stringWidth(lines[0])));
});

test("streaming markdown treats a partial fenced block as code", async () => {
  const instance = render(
    React.createElement(
      Markdown,
      { isActive: false, streaming: true },
      "Result:\n```ts\nconst answer = 42"
    )
  );
  await settle();

  const output = stripAnsi(instance.lastFrame() ?? "");
  assert.match(output, /Result:/);
  assert.match(output, /const answer = 42/);
  assert.doesNotMatch(output, /```/);
  assert.doesNotMatch(output, /^ts$/m);
});

test("select preserves a non-color selected marker while unfocused", async () => {
  const instance = render(
    React.createElement(Select, {
      defaultValue: "beta",
      options: [
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
      ],
    })
  );
  await settle();

  assert.match(stripAnsi(instance.lastFrame() ?? ""), /[✓*]\s+Beta/);
});

test("search input owns exactly one visual cursor without a native origin", async () => {
  const instance = render(
    React.createElement(SearchInput, {
      autoFocus: true,
      defaultValue: "term",
    })
  );
  await settle();

  const cursors = (stripAnsi(instance.lastFrame() ?? "").match(/█/g) ?? [])
    .length;
  assert.equal(cursors, 1);
});

test("dither charts clamp requested width after a terminal resize", async () => {
  const instance = render(
    React.createElement(
      BarChart,
      {
        animate: false,
        config: { direct: { color: "green", label: "Direct" } },
        data: [
          { direct: 34, month: "Jan" },
          { direct: 47, month: "Feb" },
          { direct: 42, month: "Mar" },
        ],
        height: 8,
        interactive: false,
        width: 58,
      },
      React.createElement(Grid, { horizontal: true }),
      React.createElement(XAxis, { dataKey: "month" }),
      React.createElement(YAxis, { tickCount: 3 }),
      React.createElement(Bar, { dataKey: "direct" })
    )
  );
  Object.defineProperty(instance.stdout, "columns", {
    configurable: true,
    value: 32,
  });
  instance.stdout.emit("resize");
  await settle();

  assert.ok(
    plainLines(instance.lastFrame() ?? "").every(
      (line) => stringWidth(line) <= 32
    )
  );
});

test("embedded terminal clamps its border to the terminal width", async () => {
  const instance = render(
    React.createElement(EmbeddedTerminal, {
      command: "termcn-test-command",
      width: 80,
    })
  );
  Object.defineProperty(instance.stdout, "columns", {
    configurable: true,
    value: 32,
  });
  instance.stdout.emit("resize");
  await settle();

  const lines = plainLines(instance.lastFrame() ?? "");
  assert.ok(
    lines.every((line) => stringWidth(line) <= 32),
    lines.map((line) => `${stringWidth(line)}: ${line}`).join("\n")
  );
});

test("app shell wraps its tip and keyboard hints in narrow terminals", async () => {
  const instance = render(
    React.createElement(
      AppShell,
      null,
      React.createElement(
        AppShell.Header,
        null,
        React.createElement(
          AppShell.Tip,
          null,
          "Press Tab to move between the command input and output"
        )
      ),
      React.createElement(AppShell.Input, {
        placeholder: "Enter a command...",
      }),
      React.createElement(
        AppShell.Content,
        { height: 3 },
        React.createElement(Text, null, "Output")
      ),
      React.createElement(AppShell.Hints, {
        items: ["tab focus", "enter submit", "↑↓ scroll"],
      })
    )
  );
  Object.defineProperty(instance.stdout, "columns", {
    configurable: true,
    value: 32,
  });
  instance.stdout.emit("resize");
  await settle();

  const lines = plainLines(instance.lastFrame() ?? "");
  assert.ok(
    lines.every((line) => stringWidth(line) <= 32),
    lines.map((line) => `${stringWidth(line)}: ${line}`).join("\n")
  );
});
