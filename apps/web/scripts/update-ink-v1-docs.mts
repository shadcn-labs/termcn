import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const documentationRoots = [
  "content/docs/components/ink",
  "content/docs/charts/ink",
  "content/docs/templates/ink",
].map((directory) => path.join(root, directory));

interface RegistryItem {
  name: string;
  registryDependencies?: string[];
}

const registry = JSON.parse(
  await fs.readFile(path.join(root, "registry.json"), "utf-8")
) as { items: RegistryItem[] };
const registryItems = new Map(
  registry.items.map((item) => [item.name, item] as const)
);
const themeHookOrder = ["use-theme", "use-unicode", "use-motion"] as const;

const dependencyName = (dependency: string): string | undefined =>
  dependency.match(/\/r\/(ink\/[^/]+)\.json$/)?.[1];

const themeHookDependencies = (itemName: string): string[] => {
  const pending = [`ink/${itemName}`];
  const visited = new Set<string>();
  const hooks = new Set<string>();

  while (pending.length > 0) {
    const name = pending.pop();
    if (!name || visited.has(name)) {
      continue;
    }
    visited.add(name);
    if (themeHookOrder.some((hook) => name === `ink/${hook}`)) {
      hooks.add(name.slice("ink/".length));
    }
    for (const dependency of registryItems.get(name)?.registryDependencies ??
      []) {
      const next = dependencyName(dependency);
      if (next) {
        pending.push(next);
      }
    }
  }

  return themeHookOrder.filter((hook) => hooks.has(hook));
};

const themeHookSources = (itemName: string): string =>
  themeHookDependencies(itemName)
    .map(
      (hook) => `<ComponentSource
  src="registry/bases/ink/hooks/${hook}.ts"
  title="hooks/${hook}.ts"
/>`
    )
    .join("\n\n");

const textInputs = new Set([
  "app-shell",
  "email-input",
  "masked-input",
  "number-input",
  "password-input",
  "path-input",
  "search-input",
  "tag-input",
  "text-area",
  "text-input",
]);
const selectionControls = new Set([
  "checkbox",
  "checkbox-group",
  "color-picker",
  "command-palette",
  "confirm",
  "date-picker",
  "dialog",
  "file-change",
  "file-picker",
  "login-flow",
  "menu",
  "model-selector",
  "multi-select",
  "pagination",
  "radio-group",
  "select",
  "setup-flow",
  "sidebar",
  "tabbed-content",
  "tabs",
  "time-picker",
  "toggle",
  "tool-approval",
  "tree-select",
  "wizard",
]);
const scrollControls = new Set([
  "breadcrumb",
  "conversation-history",
  "data-grid",
  "directory-tree",
  "json",
  "list",
  "log",
  "scroll-view",
  "table",
  "tree",
  "virtual-list",
]);
const overlays = new Set(["dialog", "drawer", "modal", "popover"]);
const buttonControls = new Set([
  "banner",
  "clipboard",
  "error-retry",
  "link",
  "notification-center",
  "stopwatch",
  "tag",
  "thinking-block",
  "timer",
  "tool-call",
]);
const visualOutput = new Set([
  "bar-chart",
  "big-text",
  "diff-view",
  "digits",
  "dither-area-chart",
  "dither-bar-chart",
  "dither-line-chart",
  "dither-pie-chart",
  "dither-radar-chart",
  "dither-sparkline",
  "gauge",
  "gradient",
  "heat-map",
  "image",
  "line-chart",
  "pie-chart",
  "progress-circle",
  "qr-code",
  "sparkline",
]);
const booleanControls = new Set(["checkbox", "toggle"]);
const multiValueControls = new Set([
  "checkbox-group",
  "multi-select",
  "tag-input",
]);

const keyboardRows = (name: string): string => {
  if (overlays.has(name)) {
    return `| Key | Behavior |
| --- | --- |
| \`Tab\` / \`Shift+Tab\` | Move through enabled controls inside the active scope. |
| \`Enter\` / \`Space\` | Activate the focused control. |
| \`Escape\` | Close only the topmost active surface and restore focus. |`;
  }
  if (textInputs.has(name)) {
    return `| Key | Behavior |
| --- | --- |
| \`Left\` / \`Right\` | Move by grapheme; completion inputs use Right to accept a suggestion. |
| \`Home\` / \`End\` | Move to the start or end. |
| \`Backspace\` / \`Delete\` | Remove one complete grapheme. |
| \`Enter\` | Submit or confirm; TextArea uses \`Ctrl+Enter\`. |
| \`Tab\` / \`Shift+Tab\` | Leave the control through Ink focus traversal. |`;
  }
  if (selectionControls.has(name)) {
    return `| Key | Behavior |
| --- | --- |
| Arrow keys | Move inside the composite control. |
| \`Home\` / \`End\` | Move to the first or last enabled item. |
| \`Enter\` / \`Space\` | Activate, select, or toggle the current item. |
| \`Escape\` | Cancel or close when the component owns a surface. |
| \`Tab\` / \`Shift+Tab\` | Move to the next or previous Termcn/Ink focus target. |`;
  }
  if (scrollControls.has(name)) {
    return `| Key | Behavior |
| --- | --- |
| Arrow keys | Move the current item or viewport. |
| \`Home\` / \`End\` | Move to the beginning or end. |
| \`PageUp\` / \`PageDown\` | Move by a page where pagination is available. |
| \`Enter\` / \`Space\` | Select or expand the current item when supported. |
| \`Tab\` / \`Shift+Tab\` | Leave the composite; Tab is not used for internal navigation. |`;
  }
  if (buttonControls.has(name)) {
    return `| Key | Behavior |
| --- | --- |
| \`Enter\` / \`Space\` | Activate the focused action when the optional action is enabled. |
| \`Escape\` | Dismiss or cancel when documented by the component API. |
| \`Tab\` / \`Shift+Tab\` | Move through Ink focus targets. |`;
  }
  return "This component does not register a keyboard handler or create a focus target.";
};

const contract = (name: string) => {
  const interactive =
    textInputs.has(name) ||
    selectionControls.has(name) ||
    scrollControls.has(name) ||
    overlays.has(name) ||
    buttonControls.has(name);
  const screenReaderBehavior = visualOutput.has(name)
    ? "Plot glyphs, pixels, gradients, and other decorative rendering are replaced by the plain value, required `alt` text, or a bounded `accessibleSummary`."
    : "Decorative borders, focus glyphs, cursor frames, and redundant hints are omitted. Labels and semantic state remain in the linear output.";
  let publicContract =
    "Presentation components continue to forward their relevant Ink `Box` or `Text` props.";
  if (booleanControls.has(name)) {
    publicContract =
      "The state contract supports both `onCheckedChange` and `onChange` with `checked` and `defaultChecked`. They are equal source-owned aliases; choose the name that best fits the copied component.";
  } else if (multiValueControls.has(name)) {
    publicContract =
      "The state contract supports both `onValueChange` and `onChange`, where values are arrays. They are equal source-owned aliases, and controlled values take precedence over defaults.";
  } else if (overlays.has(name)) {
    publicContract =
      "The surface contract supports `open`, `defaultOpen`, and `onOpenChange` together with the component's compatibility aliases. Closing through Escape affects only the topmost active scope.";
  } else if (textInputs.has(name) || selectionControls.has(name)) {
    publicContract =
      "The state contract supports both `onValueChange` and `onChange`; they are equal source-owned aliases, and controlled values take precedence over defaults. Submission and cancellation use `onSubmit` and `onCancel` where applicable.";
  }
  return `

{/* ink-v1-contract */}

## Keyboard

${keyboardRows(name)}

## Focus and composition

${interactive ? "This is one native Ink tab stop. Its input subscription is active only while focused, enabled, active, and inside the topmost focus scope. Compose it with other controls through `useInteraction`; do not attach a second renderer-wide `useInput` handler for the same keys." : "This component is presentation-only. It does not subscribe to input, claim global shortcuts, or alter Ink's focus order."}

Set \`autoFocus\` only on the intended initial control. Application-global shortcuts such as \`q\` belong to the application template and require an explicit active boundary.

## V1 public contract

${publicContract} Interactive components also accept \`id\`, \`autoFocus\`, \`isActive\`, \`disabled\`, and \`aria-label\` where applicable.

## Accessibility

Termcn targets Ink 6.8 terminal accessibility and predictable terminal screen-reader output. This is not a claim of browser ARIA behavior or general WCAG conformance. Semantic roles and supported states are owned by the component; use \`aria-label\` to provide a contextual name.

## Screen reader behavior

${screenReaderBehavior} Ink has no browser-style live-region API, so dynamic announcements are intentionally batched to meaningful state changes.

## Motion and Unicode

\`NO_MOTION=1\`, \`CI=true\`, and screen-reader mode stop component animation handles. \`NO_UNICODE=1\` selects the component's ASCII-safe defaults where it owns the glyph; caller-supplied icons, borders, and render functions remain the caller's responsibility.

## Known Ink limitations

Ink 6.8 does not expose DOM semantics or roles such as \`dialog\`, \`alert\`, \`heading\`, \`link\`, \`tree\`, \`row\`, and \`cell\`. Termcn uses the closest supported role plus explicit textual output. Reusable text controls cannot discover absolute terminal coordinates in Ink 6.8; pass \`cursorOrigin\` when IME cursor positioning is required.
`;
};

const walk = async (directory: string): Promise<string[]> => {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(entryPath)));
    } else if (entry.name.endsWith(".mdx")) {
      files.push(entryPath);
    }
  }
  return files;
};

let updated = 0;
for (const documentationRoot of documentationRoots) {
  for (const file of await walk(documentationRoot)) {
    if (
      path.basename(file) === "index.mdx" ||
      file.includes(`${path.sep}guides${path.sep}`)
    ) {
      continue;
    }
    const name = path.basename(file, ".mdx");
    let source = await fs.readFile(file, "utf-8");
    const sourceItems = [
      ...source.matchAll(
        /<ComponentSource[\s\S]*?\bbase="ink"[\s\S]*?\bname="([^"]+)"[\s\S]*?\/>/g
      ),
    ];
    const registryItemName = sourceItems.findLast(
      (match) => match[1] !== "theme-provider"
    )?.[1];
    if (!registryItemName) {
      throw new Error(`Unable to resolve Ink registry item for ${file}`);
    }
    const hookSources = themeHookSources(registryItemName);
    const providerSource =
      /<ComponentSource\n {2}base="ink"\n {2}name="theme-provider"\n {2}title="components\/ui\/theme-provider\.tsx"\n\/>\n\n/g;
    const existingThemeHooks =
      /(?:<ComponentSource\n {2}src="registry\/bases\/ink\/hooks\/use-(?:theme|unicode|motion)\.ts"\n {2}title="hooks\/use-(?:theme|unicode|motion)\.ts"\n\/>\n\n?)+/g;
    source = source
      .replace(providerSource, hookSources ? `${hookSources}\n\n` : "")
      .replace(existingThemeHooks, hookSources ? `${hookSources}\n\n` : "");
    const legacySequence =
      /<ComponentSource\n {2}src="registry\/bases\/ink\/hooks\/use-(?:focus|input)\.ts"\n {2}title="hooks\/use-(?:focus|input)\.ts"\n\/>\n\n/g;
    let replacedLegacyHook = false;
    source = source.replace(legacySequence, () => {
      if (replacedLegacyHook) {
        return "";
      }
      replacedLegacyHook = true;
      return `<ComponentSource
  src="registry/bases/ink/hooks/use-interaction.tsx"
  title="hooks/use-interaction.tsx"
/>

`;
    });
    const markerIndexes = [
      source.indexOf("{/* ink-v1-contract */}"),
      source.indexOf("<!-- ink-v1-contract -->"),
    ].filter((index) => index >= 0);
    const markerIndex =
      markerIndexes.length === 0 ? -1 : Math.min(...markerIndexes);
    source =
      markerIndex === -1
        ? `${source.trimEnd()}${contract(name)}`
        : `${source.slice(0, markerIndex).trimEnd()}${contract(name)}`;
    await fs.writeFile(file, source);
    updated += 1;
  }
}

console.log(
  `Updated ${updated} Ink component and template documentation pages.`
);
