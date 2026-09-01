import { structuredPatch } from "diff";
import { bold, dim, green, yellow } from "kleur/colors";

import type { DryRunFile, DryRunResult } from "@/src/utils/dry-run";

const MAX_OVERVIEW_FILES = 5;

export function formatDryRunResult(
  result: DryRunResult,
  componentNames: string[],
  options: { diff?: string | true; view?: string | true } = {}
) {
  if (options.diff) {
    return formatFiles(result, componentNames, "diff", options.diff);
  }
  if (options.view) {
    return formatFiles(result, componentNames, "view", options.view);
  }

  const lines = [header(componentNames), ""];
  for (const file of result.files) {
    lines.push(`${actionGlyph(file.action)} ${file.path} (${file.action})`);
  }
  appendList(lines, "Dependencies", result.dependencies);
  appendList(lines, "Dev dependencies", result.devDependencies);
  if (result.envVars) {
    appendList(
      lines,
      `Environment (${result.envVars.path})`,
      Object.keys(result.envVars.variables)
    );
  }
  if (result.docs) lines.push("", result.docs.trim());
  lines.push("", dim("Run without --dry-run to apply."));
  return lines.join("\n");
}

function formatFiles(
  result: DryRunResult,
  componentNames: string[],
  mode: "diff" | "view",
  filter: string | true
) {
  const selected =
    typeof filter === "string"
      ? result.files.filter((file) => matchesPath(file.path, filter))
      : result.files.slice(0, MAX_OVERVIEW_FILES);
  const lines = [header(componentNames), ""];

  if (selected.length === 0) {
    lines.push(yellow("No matching files."));
  }

  for (const file of selected) {
    lines.push(bold(`${file.path} (${file.action})`));
    lines.push(mode === "view" ? file.content : formatDiff(file));
    lines.push("");
  }

  if (filter === true && result.files.length > MAX_OVERVIEW_FILES) {
    lines.push(
      dim(
        `Showing ${MAX_OVERVIEW_FILES} of ${result.files.length} files. Pass a path to focus the output.`
      )
    );
  }
  lines.push(dim("Run without --dry-run to apply."));
  return lines.join("\n");
}

function formatDiff(file: DryRunFile) {
  if (file.action === "skip") return dim("No changes.");
  if (file.action === "create") {
    return file.content
      .split("\n")
      .map((line) => green(`+${line}`))
      .join("\n");
  }

  const patch = structuredPatch(
    file.path,
    file.path,
    file.existingContent ?? "",
    file.content,
    "before",
    "after"
  );
  return patch.hunks
    .flatMap((hunk) => [
      `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`,
      ...hunk.lines,
    ])
    .join("\n");
}

function header(componentNames: string[]) {
  return bold(`termcn add ${componentNames.join(" ")} (dry run)`);
}

function matchesPath(filePath: string, filter: string) {
  return (
    filePath === filter ||
    filePath.includes(filter) ||
    filePath.endsWith(filter)
  );
}

function actionGlyph(action: DryRunFile["action"]) {
  if (action === "create") return green("+");
  if (action === "overwrite") return yellow("~");
  return dim("=");
}

function appendList(lines: string[], label: string, values: string[]) {
  if (values.length === 0) return;
  lines.push("", bold(label));
  for (const value of values) lines.push(`- ${value}`);
}
