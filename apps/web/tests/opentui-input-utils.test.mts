import assert from "node:assert/strict";
import test from "node:test";

import {
  decodePaste,
  deleteBackwardAt,
  deleteForwardAt,
  getKeyText,
  insertAt,
  toSingleLine,
} from "../registry/bases/opentui/lib/input-utils.ts";

test("getKeyText preserves the typed sequence", () => {
  assert.equal(getKeyText({ name: "a", sequence: "A" }), "A");
  assert.equal(getKeyText({ name: "space", sequence: " " }), " ");
  assert.equal(getKeyText({ name: "!", sequence: "!" }), "!");
});

test("getKeyText rejects navigation, modifiers, and control sequences", () => {
  assert.equal(getKeyText({ name: "left", sequence: "\u001B[D" }), "");
  assert.equal(getKeyText({ ctrl: true, name: "c", sequence: "\u0003" }), "");
  assert.equal(getKeyText({ name: "x", option: true, sequence: "x" }), "");
});

test("decodePaste removes ANSI escape sequences", () => {
  const bytes = new TextEncoder().encode(
    "\u001B[31mred\u001B[0m \u001B]8;;https://example.com\u0007link\u001B]8;;\u0007"
  );
  assert.equal(decodePaste(bytes), "red link");
});

test("toSingleLine removes pasted line breaks", () => {
  assert.equal(toSingleLine("first\r\nsecond\nthird"), "firstsecondthird");
});

test("cursor helpers insert and delete at the requested offset", () => {
  assert.equal(insertAt("ac", 1, "B"), "aBc");
  assert.deepEqual(deleteBackwardAt("abc", 2), {
    cursorOffset: 1,
    value: "ac",
  });
  assert.deepEqual(deleteBackwardAt("abc", 0), {
    cursorOffset: 0,
    value: "abc",
  });
  assert.equal(deleteForwardAt("abc", 1), "ac");
  assert.equal(deleteForwardAt("abc", 3), "abc");
});
