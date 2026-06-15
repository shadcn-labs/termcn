# Official shadcn-ui/ui Directory

**Repo:** https://github.com/shadcn-ui/ui  
**File:** `apps/v4/registry/directory.json`  
**Example PR:** https://github.com/shadcn-ui/ui/pull/10896

## Entry format

Append a new object at the **end** of the JSON array:

```json
{
  "name": "@scope",
  "homepage": "https://example.com",
  "url": "https://example.com/r/{name}.json",
  "description": "One sentence describing what the registry provides.",
  "logo": "<svg>...</svg>"
}
```

### Field rules

| Field | Required | Notes |
|-------|----------|-------|
| `name` | Yes | Scoped name with `@` prefix, e.g. `@ogimagecn` |
| `homepage` | Yes | Public docs or marketing site |
| `url` | Yes | Component JSON pattern; must use `{name}` placeholder |
| `description` | Yes | Single sentence, ≤ ~160 characters |
| `logo` | Recommended | Inline SVG string; see existing entries for style |

Do not reorder or edit existing entries. Append only.

## PR details

**Branch:** `feat/<scope-without-at>-directory`  
**Title:** `feat(registry): add @scope`  
**Commit:** `feat(registry): add @scope`

**Body template:**

```markdown
## Summary

Adds `@scope` to the community registry directory.

- **Registry URL**: `https://example.com/r/{name}.json`
- **Homepage**: https://example.com
- **Description**: <description>

## Test plan

- [ ] `curl https://example.com/r/registry.json` returns valid JSON
- [ ] `npx shadcn@latest add @scope/<sample-component>` installs successfully
```

## Review expectations

- Maintainer approval required (typically @shadcn)
- PR is small — one JSON object
- Vercel deploy preview may require team authorization on first contribution
- Response time varies; follow up politely after 3–5 business days

## Mapping from registry profile

```
name        ← profile.scope
homepage    ← profile.homepage
url         ← profile.componentUrlPattern
description ← profile.description
logo        ← profile.logo (if present)
```
