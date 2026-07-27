import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { cleanup, render } from "ink-testing-library";
import React from "react";

import { Box } from "../registry/bases/ink/ui/box.tsx";
import { Checkbox } from "../registry/bases/ink/ui/checkbox.tsx";
import { DataGrid } from "../registry/bases/ink/ui/data-grid.tsx";
import { DatePicker } from "../registry/bases/ink/ui/date-picker.tsx";
import { Markdown } from "../registry/bases/ink/ui/markdown.tsx";
import { ThemeProvider } from "../registry/bases/ink/ui/theme-provider.tsx";
import { ToolCall } from "../registry/bases/ink/ui/tool-call.tsx";

test.afterEach(() => cleanup());

test("NO_UNICODE changes component-owned visuals without mutating user text", async () => {
  const instance = render(
    React.createElement(
      ThemeProvider,
      { noUnicode: true },
      React.createElement(
        Box,
        { border: true, borderStyle: "round" },
        React.createElement(Checkbox, { label: "界" })
      )
    )
  );
  await delay(25);
  const output = instance.lastFrame() ?? "";
  assert.match(output, /\[ \] 界/);
  assert.match(output, /\+-+\+/);
  assert.doesNotMatch(output, /[■□▪╭╮╰╯]/);
});

test("NO_UNICODE reaches composite, data, markdown, and status visuals", async () => {
  const instance = render(
    React.createElement(
      ThemeProvider,
      { noUnicode: true },
      React.createElement(
        Box,
        null,
        React.createElement(DataGrid, {
          columns: [{ header: "Name", key: "name" }],
          data: [{ name: "界" }],
          disabled: true,
        }),
        React.createElement(DatePicker, {
          defaultValue: new Date(2025, 0, 2),
          disabled: true,
        }),
        React.createElement(Markdown, null, "- Item\n---"),
        React.createElement(ToolCall, {
          collapsible: false,
          isActive: false,
          name: "build",
          status: "success",
        })
      )
    )
  );
  await delay(50);
  const output = instance.lastFrame() ?? "";
  assert.match(output, /界/);
  assert.doesNotMatch(output, /[│─╭╮╰╯▲▼✓✗●■□▪█░•⌘→←↑↓]/);
});
