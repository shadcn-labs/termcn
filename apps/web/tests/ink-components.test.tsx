/* eslint-disable vitest/no-import-node-test, vitest/prefer-importing-vitest-globals */
import assert from "node:assert/strict";
import { test } from "node:test";
import { setTimeout } from "node:timers/promises";

import { Box } from "ink";
import { render } from "ink-testing-library";
import React from "react";

import { getProgressPercent } from "@/registry/bases/ink/lib/progress-utils";
import { Confirm } from "@/registry/bases/ink/ui/confirm";
import { EmailInput } from "@/registry/bases/ink/ui/email-input";
import { MaskedInput } from "@/registry/bases/ink/ui/masked-input";
import { MultiSelect } from "@/registry/bases/ink/ui/multi-select";
import { NumberInput } from "@/registry/bases/ink/ui/number-input";
import { PasswordInput } from "@/registry/bases/ink/ui/password-input";
import { PathInput } from "@/registry/bases/ink/ui/path-input";
import { SearchInput } from "@/registry/bases/ink/ui/search-input";
import { Select } from "@/registry/bases/ink/ui/select";
import { TextArea } from "@/registry/bases/ink/ui/text-area";
import { TextInput } from "@/registry/bases/ink/ui/text-input";

const settle = () => setTimeout(20);

test("uncontrolled Ink inputs keep rendering while onChange is set", async () => {
  const textChanges: string[] = [];
  const text = render(
    <TextInput
      autoFocus
      bordered={false}
      onChange={(value) => textChanges.push(value)}
    />
  );
  await settle();
  text.stdin.write("hello");
  await settle();
  assert.equal(textChanges.at(-1), "hello");
  assert.match(text.lastFrame() ?? "", /hello/u);
  text.unmount();

  const passwordChanges: string[] = [];
  const password = render(
    <PasswordInput
      autoFocus
      onChange={(value) => passwordChanges.push(value)}
    />
  );
  await settle();
  password.stdin.write("secret");
  await settle();
  assert.equal(passwordChanges.at(-1), "secret");
  assert.match(password.lastFrame() ?? "", /●{6}/u);
  password.unmount();

  const emailChanges: string[] = [];
  const email = render(
    <EmailInput autoFocus onChange={(value) => emailChanges.push(value)} />
  );
  await settle();
  email.stdin.write("me@g");
  await settle();
  assert.equal(emailChanges.at(-1), "me@g");
  assert.match(email.lastFrame() ?? "", /me@g/u);
  email.unmount();

  const maskedChanges: string[] = [];
  const masked = render(
    <MaskedInput
      autoFocus
      mask="(###) ###-####"
      onChange={(value) => maskedChanges.push(value)}
    />
  );
  await settle();
  masked.stdin.write("123abc");
  await settle();
  assert.equal(maskedChanges.at(-1), "123");
  assert.match(masked.lastFrame() ?? "", /\(123\)/u);
  masked.unmount();

  const numberChanges: number[] = [];
  const number = render(
    <NumberInput autoFocus onChange={(value) => numberChanges.push(value)} />
  );
  await settle();
  number.stdin.write("42");
  await settle();
  assert.equal(numberChanges.at(-1), 42);
  assert.match(number.lastFrame() ?? "", /42/u);
  number.unmount();

  const pathChanges: string[] = [];
  const path = render(
    <PathInput autoFocus onChange={(value) => pathChanges.push(value)} />
  );
  await settle();
  path.stdin.write("missing-path");
  await settle();
  assert.equal(pathChanges.at(-1), "missing-path");
  assert.match(path.lastFrame() ?? "", /missing-path/u);
  path.unmount();

  const searchChanges: string[] = [];
  const search = render(
    <SearchInput autoFocus onChange={(value) => searchChanges.push(value)} />
  );
  await settle();
  search.stdin.write("query");
  await settle();
  assert.equal(searchChanges.at(-1), "query");
  assert.match(search.lastFrame() ?? "", /query/u);
  search.unmount();

  const areaChanges: string[] = [];
  const area = render(
    <TextArea autoFocus onChange={(value) => areaChanges.push(value)} />
  );
  await settle();
  area.stdin.write("first\nsecond");
  await settle();
  assert.equal(areaChanges.at(-1), "first\nsecond");
  assert.match(area.lastFrame() ?? "", /first/u);
  assert.match(area.lastFrame() ?? "", /second/u);
  area.unmount();
});

test("text, password, and email inputs edit at the cursor", async () => {
  const textChanges: string[] = [];
  const text = render(
    <TextInput
      autoFocus
      bordered={false}
      value="ac"
      onChange={(value) => textChanges.push(value)}
    />
  );
  await settle();
  text.stdin.write("\u001B[D");
  await settle();
  text.stdin.write("b");
  await settle();
  assert.equal(textChanges.at(-1), "abc");
  text.unmount();

  const passwordChanges: string[] = [];
  const password = render(
    <PasswordInput
      autoFocus
      value="ac"
      onChange={(value) => passwordChanges.push(value)}
    />
  );
  await settle();
  password.stdin.write("\u001B[D");
  await settle();
  password.stdin.write("b");
  await settle();
  assert.equal(passwordChanges.at(-1), "abc");
  password.unmount();

  const emailChanges: string[] = [];
  const email = render(
    <EmailInput
      autoFocus
      value="a@c"
      onChange={(value) => emailChanges.push(value)}
    />
  );
  await settle();
  email.stdin.write("\u001B[D");
  await settle();
  email.stdin.write("b@");
  await settle();
  assert.equal(emailChanges.at(-1), "a@bc");
  email.unmount();
});

test("email and path completion use Right Arrow instead of Tab", async () => {
  const emailChanges: string[] = [];
  const email = render(
    <EmailInput
      autoFocus
      value="me@gm"
      onChange={(value) => emailChanges.push(value)}
    />
  );
  await settle();
  email.stdin.write("\t");
  await settle();
  assert.deepEqual(emailChanges, []);
  email.stdin.write("\u001B[C");
  await settle();
  assert.equal(emailChanges.at(-1), "me@gmail.com");
  email.unmount();
});

test("Tab moves focus between inputs without inserting text", async () => {
  const firstChanges: string[] = [];
  const secondChanges: string[] = [];
  const inputs = render(
    <Box flexDirection="column">
      <TextInput
        autoFocus
        bordered={false}
        onChange={(value) => firstChanges.push(value)}
      />
      <TextInput
        bordered={false}
        onChange={(value) => secondChanges.push(value)}
      />
    </Box>
  );

  await settle();
  inputs.stdin.write("a");
  await settle();
  inputs.stdin.write("\t");
  await settle();
  inputs.stdin.write("b");
  await settle();

  assert.equal(firstChanges.at(-1), "a");
  assert.equal(secondChanges.at(-1), "b");
  inputs.unmount();
});

test("selection components honor focus and disabled state", async () => {
  const selected: string[] = [];
  const select = render(
    <Select
      autoFocus
      options={[
        { disabled: true, label: "Disabled", value: "disabled" },
        { label: "Enabled", value: "enabled" },
      ]}
      onSubmit={(value) => selected.push(value)}
    />
  );
  await settle();
  select.stdin.write("\r");
  await settle();
  assert.deepEqual(selected, ["enabled"]);
  select.unmount();

  let confirmed = false;
  const confirm = render(
    <Confirm
      autoFocus
      isDisabled
      message="Continue?"
      onConfirm={() => {
        confirmed = true;
      }}
    />
  );
  await settle();
  confirm.stdin.write("y");
  await settle();
  assert.equal(confirmed, false);
  confirm.unmount();

  const multiChanges: string[][] = [];
  const multi = render(
    <MultiSelect
      autoFocus
      isDisabled
      options={[{ label: "One", value: "one" }]}
      onChange={(value) => multiChanges.push(value)}
    />
  );
  await settle();
  multi.stdin.write(" ");
  await settle();
  assert.deepEqual(multiChanges, []);
  multi.unmount();
});

test("ProgressBar percentage is safe and clamped", () => {
  assert.equal(getProgressPercent(-5), 0);
  assert.equal(getProgressPercent(125), 100);
  assert.equal(getProgressPercent(5, 0), 0);
  assert.equal(getProgressPercent(50, -10), 0);
  assert.equal(getProgressPercent(Number.NaN, 100), 0);
  assert.equal(getProgressPercent(Number.POSITIVE_INFINITY), 0);
  assert.equal(getProgressPercent(25, 50), 50);
});
