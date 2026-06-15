# shadcntemplates

**Repo:** https://github.com/shadcnblocks/shadcntemplates  
**Directory:** `content/`  
**Site:** https://shadcntemplates.com

## File naming

Create: `content/{author}-{templatename}.md`

- `author` ← `profile.githubUsername` (lowercase, no spaces)
- `templatename` ← short slug from `profile.name` (lowercase, hyphens)

Example: `aniket-508-ogimagecn.md`

## Open-source listing template

```markdown
---
title: Display Name
author: github-username
avatarUrl: https://github.com/username.png
createdAt: '2026-06-16T12:00:00.000Z'
demoUrl: 'https://example.com'
description: >-
  Two to three sentences describing the registry. Mention shadcn/ui compatibility
  and what components or blocks are included.
distribution: open-source
githubUrl: 'https://github.com/org/repo'
category:
  - react
  - nextjs
  - tailwind
  - shadcn-registry
  - component-library
---

## Overview

<profile.descriptionLong expanded into 1 short paragraph>

## Features

- **shadcn CLI** – Install with `npx shadcn@latest add @scope/component`
- **Copy-paste** – Components live in your codebase
- **<Feature 3>** – <specific value prop>
```

## Premium listing

Only if `profile.distribution` is `premium`:

```markdown
---
title: Display Name
author: github-username
avatarUrl: 'https://...'
demoUrl: 'https://example.com'
price: 0
affiliateUrl: 'https://example.com'
description: Short premium description
distribution: premium
themeKey: author-slug
category:
  - react
  - shadcn-registry
  - shadcn-ui
---
```

**Policy:** One free premium listing per user. Multiple premium listings require a $100 fee (see repo README). All premium listings are reviewed before publishing.

## PR details

**Title:** `docs: add <name> to shadcntemplates`  
**Body:** Brief summary + links to homepage and GitHub.

## Category guidance

Always include `shadcn-registry`. Add from `profile.categories` as applicable:

- `component-library`, `block-library`, `ui-kit`, `landing-page`, `nextjs`, `react`, `tailwind`, `astro`
