import assert from "node:assert/strict";
import test from "node:test";

import {
  cursorCellOffset,
  graphemeLength,
  insertAtGrapheme,
  padToTerminalWidth,
  removeGraphemeBefore,
  splitGraphemes,
  terminalWidth,
  truncateToTerminalWidth,
} from "../registry/bases/ink/lib/terminal-text.ts";

test("segments emoji, combining marks, and ZWJ sequences as graphemes", () => {
  const value = "A👩🏽‍💻e\u0301界";
  assert.deepEqual(splitGraphemes(value), ["A", "👩🏽‍💻", "e\u0301", "界"]);
  assert.equal(graphemeLength(value), 4);
});

test("edits and cursor offsets use grapheme and terminal-cell positions", () => {
  const inserted = insertAtGrapheme("A界", 1, "👩🏽‍💻");
  assert.equal(inserted, "A👩🏽‍💻界");
  assert.equal(cursorCellOffset(inserted, 2), 3);

  const removed = removeGraphemeBefore(inserted, 2);
  assert.deepEqual(removed, { cursor: 1, value: "A界" });
});

test("truncates and pads by terminal cells without splitting graphemes", () => {
  assert.equal(terminalWidth("界A"), 3);
  assert.equal(truncateToTerminalWidth("界ABC", 4), "界A…");
  assert.equal(truncateToTerminalWidth("👩🏽‍💻ABC", 3), "👩🏽‍💻…");
  assert.equal(terminalWidth(padToTerminalWidth("界", 5)), 5);
});
