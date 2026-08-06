# Tegami changelogs

This folder holds pending [Tegami](https://tegami.dev) changelog entries and the publish lock (`publish-lock.yaml`, written by `tegami version`). It replaces the old `.changeset/` workflow.

## Add a changelog entry

Run the interactive prompt:

```bash
pnpm tegami
```

…or write a markdown file here manually. Package keys go under a `packages` field and the body needs at least one heading:

```md title=".tegami/2026-08-06-add-button-component.md"
---
packages:
  "termcn": minor
---

## Add Button component

New Ink-based Button component with variant support.
```

`termcn` is the only publishable package.

## Release flow (two-PR, Changesets-style)

1. PRs add `.tegami/*.md` entries.
2. On `main`, CI runs `pnpm tegami ci`, applies versions, and opens a **Version Packages** PR.
3. Merging that PR triggers the next CI run to publish from the publish lock and create GitHub releases.

The publish lock lives in git, so failed publish jobs can be retried safely.
