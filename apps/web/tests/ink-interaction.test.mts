import assert from "node:assert/strict";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { Box } from "ink";
import { cleanup, render } from "ink-testing-library";
import React from "react";

import {
  FocusScope,
  isActivationKey,
} from "../registry/bases/ink/hooks/use-interaction.tsx";
import { Checkbox } from "../registry/bases/ink/ui/checkbox.tsx";
import { Toggle } from "../registry/bases/ink/ui/toggle.tsx";

const settle = () => delay(50);

test.afterEach(() => cleanup());

test("only the focused control responds and Tab moves native focus", async () => {
  const changes: string[] = [];
  const instance = render(
    React.createElement(
      Box,
      null,
      React.createElement(Checkbox, {
        autoFocus: true,
        label: "Alpha",
        onCheckedChange: (checked) => changes.push(`alpha:${checked}`),
      }),
      React.createElement(Toggle, {
        label: "Beta",
        onCheckedChange: (checked) => changes.push(`beta:${checked}`),
      })
    )
  );

  await settle();
  instance.stdin.write(" ");
  await settle();
  assert.deepEqual(changes, ["alpha:true"]);

  instance.stdin.write("\t");
  await settle();
  instance.stdin.write(" ");
  await settle();
  assert.deepEqual(changes, ["alpha:true", "beta:true"]);
});

test("disabled controls are skipped and never process input", async () => {
  const changes: string[] = [];
  const instance = render(
    React.createElement(
      Box,
      null,
      React.createElement(Checkbox, {
        autoFocus: true,
        disabled: true,
        label: "Disabled",
        onCheckedChange: () => changes.push("disabled"),
      }),
      React.createElement(Toggle, {
        autoFocus: true,
        label: "Enabled",
        onCheckedChange: () => changes.push("enabled"),
      })
    )
  );
  await settle();
  instance.stdin.write(" ");
  await settle();
  assert.deepEqual(changes, ["enabled"]);
});

test("FocusScope owns Tab and Escape while active", async () => {
  const changes: string[] = [];
  let escaped = 0;
  const instance = render(
    React.createElement(
      FocusScope,
      { active: true, onEscapeKey: () => (escaped += 1) },
      React.createElement(Checkbox, {
        label: "One",
        onCheckedChange: () => changes.push("one"),
      }),
      React.createElement(Toggle, {
        label: "Two",
        onCheckedChange: () => changes.push("two"),
      })
    )
  );
  await settle();
  instance.stdin.write(" ");
  await settle();
  instance.stdin.write("\t");
  await settle();
  instance.stdin.write(" ");
  instance.stdin.write("\u001B");
  await settle();
  assert.deepEqual(changes, ["one", "two"]);
  assert.equal(escaped, 1);
});

test("activation ignores kitty release events", () => {
  assert.equal(
    isActivationKey(" ", { eventType: "release", return: false } as never),
    false
  );
  assert.equal(isActivationKey(" ", { return: false } as never), true);
});
