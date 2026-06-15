---
name: launch-shadcn-registry
description: >-
  Launch and promote a custom shadcn/ui registry end-to-end: validate registry.json,
  prepare the official shadcn-ui/ui directory PR, community directory PRs (registry.directory,
  shadcntemplates, birobirobiro/awesome-shadcn-ui, bytefer/awesome-shadcn-ui), and draft
  social posts for Reddit r/shadcn, X, Dev.to, and Hacker News. Use whenever the user says
  "launch my registry", "list on shadcn directory", "submit to awesome-shadcn-ui",
  "announce my shadcn registry", "registry.directory PR", or wants to promote a new
  @scope registry — even if they do not say "launch-shadcn-registry" explicitly.
compatibility: Requires network access, curl, gh (GitHub CLI), and git. User must be authenticated with gh for PR creation.
---

# Launch shadcn Registry

Orchestrate listing and announcing a custom shadcn/ui registry across official and community directories, then draft platform-specific social posts.

## Before You Start

Confirm the user wants a **full launch** or a **subset** (e.g. official directory only, or social drafts only). Default to the full workflow unless they narrow scope.

Collect or infer a **registry profile**. If missing fields, ask before generating artifacts. Use [templates/registry-profile.example.json](templates/registry-profile.example.json) as the shape; validate against [templates/registry-profile.schema.json](templates/registry-profile.schema.json).

Required profile fields:

| Field | Purpose |
|-------|---------|
| `scope` | Registry scope, e.g. `@ogimagecn` |
| `name` | Display name |
| `homepage` | Marketing/docs URL |
| `registryBaseUrl` | Base URL for JSON files (no trailing slash) |
| `componentUrlPattern` | URL pattern with `{name}` placeholder, e.g. `https://example.com/r/{name}.json` |
| `description` | One sentence (≤160 chars) for directories |
| `descriptionLong` | 2–3 sentences for awesome lists and social |
| `githubUrl` | Source repo |
| `githubUsername` | For avatar URLs and filenames |
| `distribution` | `open-source` or `premium` |
| `categories` | Tags for shadcntemplates / awesome lists |
| `installExample` | e.g. `npx shadcn@latest add @scope/component-name` |
| `logo` | Inline SVG string for official directory (optional but recommended) |
| `registryIndexPath` | Path to registry index relative to `registryBaseUrl`, defaults to `/registry.json` (optional) |
| `sampleComponents` | Array of component slugs to validate during preflight, e.g. `["og-image"]` (optional) |
| `features` | Bullet points for shadcntemplates and social posts (optional) |

## Workflow Overview

Copy this checklist and track progress:

```
Launch Progress:
- [ ] Phase 1: Preflight validation
- [ ] Phase 2: Generate directory artifacts
- [ ] Phase 3: Open GitHub PRs (user approval per PR)
- [ ] Phase 4: Draft social posts
- [ ] Phase 5: Post-launch follow-up
```

## Phase 1: Preflight

Read [references/preflight.md](references/preflight.md) and run validation before generating any PRs.

```bash
bash scripts/validate-registry.sh <registryBaseUrl> [sample-component-name]
```

Fix all blockers before continuing. Common failures:

- `registry.json` not public or wrong path
- Component JSON 404
- Duplicate `@scope` in official directory
- `description` too long or marketing-heavy for official listing

Fetch the official directory to check duplicates:

```bash
curl -fsSL https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/directory.json | grep -i "<scope>"
```

## Phase 2: Generate Artifacts

From the registry profile, generate all submission files. Read the relevant reference **only for targets the user wants**:

| Target | Reference | Output |
|--------|-----------|--------|
| Official shadcn-ui/ui | [references/shadcn-ui-official.md](references/shadcn-ui-official.md) | JSON entry + PR body |
| registry.directory | [references/registry-directory.md](references/registry-directory.md) | JSON entry + PR body |
| shadcntemplates | [references/shadcntemplates.md](references/shadcntemplates.md) | `content/{author}-{name}.md` |
| birobirobiro awesome | [references/awesome-birobirobiro.md](references/awesome-birobirobiro.md) | README table row |
| bytefer awesome | [references/awesome-bytefer.md](references/awesome-bytefer.md) | README table row |

Present artifacts grouped by repo. Include:

1. Exact file path to create or edit
2. Full content to add (not diffs alone)
3. Suggested PR title and body

### PR title convention

Use `feat(registry): add <scope>` for official shadcn-ui/ui (matches [PR #10896](https://github.com/shadcn-ui/ui/pull/10896)). Use `docs: add <name> to <section>` for awesome lists and `feat: add <name> registry` for registry.directory.

## Phase 3: Open GitHub PRs

Use `gh` for all GitHub operations. **Ask the user before creating each PR** unless they explicitly asked to open all PRs.

Standard fork-and-PR flow per repo:

```bash
# Example: official shadcn-ui/ui
gh repo fork shadcn-ui/ui --clone=false
git clone https://github.com/<user>/ui.git /tmp/ui-registry-pr
cd /tmp/ui-registry-pr
git remote add upstream https://github.com/shadcn-ui/ui.git
git fetch upstream && git checkout -b feat/<scope>-directory upstream/main
# edit apps/v4/registry/directory.json — append entry at end of array
git add apps/v4/registry/directory.json
git commit -m "feat(registry): add <scope>"
git push -u origin HEAD
gh pr create --repo shadcn-ui/ui --title "feat(registry): add <scope>" --body "$(cat <<'EOF'
## Summary
Adds <scope> to the community registry directory.

- **Registry URL**: `<componentUrlPattern>`
- **Homepage**: <homepage>
- **Description**: <description>

## Test plan
- [ ] `curl <registryBaseUrl>/registry.json` returns valid JSON
- [ ] `npx shadcn@latest add <installExample>` installs successfully
EOF
)"
```

**Recommended PR order:**

1. Official `shadcn-ui/ui` (highest leverage; may take maintainer review)
2. `rbadillap/registry.directory`
3. `shadcnblocks/shadcntemplates`
4. `birobirobiro/awesome-shadcn-ui` and `bytefer/awesome-shadcn-ui` (can be parallel)

Track PR URLs in the launch checklist. Do not draft social posts as "published" until the registry is live and at least one directory listing is merged or submitted.

## Phase 4: Social Drafts

Read platform references and produce **ready-to-paste drafts** (user posts manually):

| Platform | Reference |
|----------|-----------|
| Reddit r/shadcn | [references/social/reddit.md](references/social/reddit.md) |
| X | [references/social/x.md](references/social/x.md) |
| Dev.to | [references/social/devto.md](references/social/devto.md) |
| Hacker News | [references/social/hackernews.md](references/social/hackernews.md) |

Tailor each draft from the registry profile. Include the install command, homepage, and GitHub link. Avoid hype; lead with the concrete problem the registry solves.

**Timing:** Draft social posts after preflight passes. Suggest posting after the official directory PR is merged (or at minimum after `registry.json` is live).

## Phase 5: Post-Launch

After PRs are open or merged:

1. Share PR links with the user in a summary table (repo, PR URL, status)
2. Remind user to respond to review comments within 48h
3. After official merge, suggest updating social drafts to mention "now listed in the shadcn registry directory"
4. If a PR is rejected, read maintainer feedback and adjust description or registry format — do not resubmit unchanged

## Rules

- Never submit to directories before preflight passes
- Never claim listings are live until PRs are merged
- Never auto-post to Reddit, X, Dev.to, or HN — drafts only
- Keep official `directory.json` entry at the **end** of the array (append only)
- One registry profile drives all artifacts — do not invent different descriptions per platform without user approval
- For premium registries on shadcntemplates, note the one-free / $100 multi-premium policy; do not promise approval

## Example

**User:** "Launch @ogimagecn — https://ogimagecn.vercel.app"

**Agent:**

1. Build profile from site + `curl https://ogimagecn.vercel.app/r/registry.json`
2. Run `validate-registry.sh https://ogimagecn.vercel.app og-image`
3. Generate JSON for official directory, registry.directory, shadcntemplates markdown, awesome list rows
4. Ask: "Open PRs to all 5 repos?"
5. On approval, create PRs via `gh`
6. Deliver Reddit, X, Dev.to, and HN drafts

## Additional Resources

- Registry profile schema: [templates/registry-profile.schema.json](templates/registry-profile.schema.json)
- Example profile: [templates/registry-profile.example.json](templates/registry-profile.example.json)
- Validation script: [scripts/validate-registry.sh](scripts/validate-registry.sh)
