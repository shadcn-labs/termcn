# Dev.to

**Posting:** Manual only. Draft for the user to paste or publish via Dev.to editor.

## Title templates

```
Building a shadcn/ui Registry for {Use Case}
```

```
How I launched {name}: a shadcn-compatible component registry
```

## Tags

Suggest 4 tags from: `react`, `tailwindcss`, `opensource`, `webdev`, `nextjs`, `typescript`, `shadcn`

## Article template

```markdown
---
title: Building a shadcn/ui Registry for {Use Case}
published: false
tags: react, tailwindcss, opensource, webdev
---

I needed {specific problem} in my React projects. Existing options didn't fit shadcn's copy-paste model, so I built **{name}** — a shadcn-compatible registry for {use case}.

## What it is

{name} ({homepage}) distributes {component summary} through the shadcn CLI. Components land in your codebase — no opaque npm dependency.

## Quick start

Add the registry to your project, then install a component:

\`\`\`bash
{installExample}
\`\`\`

Browse all components at {homepage}.

## What's included

- **{Component A}** — {one line}
- **{Component B}** — {one line}
- **{Component C}** — {one line}

## How registries work (brief)

shadcn registries expose a `registry.json` index and per-component JSON files. The CLI fetches these and copies source into your project. Our registry lives at:

\`\`\`
{registryBaseUrl}/registry.json
\`\`\`

## Repo and feedback

Source: {githubUrl}

If you try it, I'd love issues or PRs — especially for {specific request, e.g. more templates, dark mode variants, docs}.
```

## Tone

- Tutorial / build log angle performs better than pure announcement
- Include real install commands and at least one code snippet if a component has a simple usage example
- Mention official directory listing only if/when the PR is merged
