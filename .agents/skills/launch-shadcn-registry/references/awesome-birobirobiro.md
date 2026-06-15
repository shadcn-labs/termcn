# birobirobiro/awesome-shadcn-ui

**Repo:** https://github.com/birobirobiro/awesome-shadcn-ui  
**File:** `README.md`  
**Site:** https://awesome-shadcn-ui.vercel.app (has submission form alternative)

## Section selection

For registries, add to the **Registries** section table (not Libs and Components).

If the resource is broader than a registry, use **Libs and Components** or **Tools** — confirm with user.

## Row format

```markdown
| scope-slug | <descriptionLong — one sentence, factual> | [Link](<homepage>) | <ISO-8601 UTC timestamp> |
```

### Example

```markdown
| ogimagecn | Beautiful OG images, made simple. Ready to use, customizable Open Graph image components for React. | [Link](https://ogimagecn.vercel.app) | 2026-06-16T12:00:00.000Z |
```

### Field rules

| Column | Source |
|--------|--------|
| Name | Lowercase slug without `@` (e.g. `ogimagecn`) |
| Description | `profile.descriptionLong` or `profile.description` |
| Link | `profile.homepage` |
| Date | Current UTC time in `YYYY-MM-DDTHH:mm:ss.000Z` format |

Insert the row in **alphabetical order** within the Registries table if the table is sorted; otherwise append before the next `##` section.

## PR details

**Title:** `docs: add <name> to Registries`  
**Body:**

```markdown
## Summary

Adds <name> (<homepage>) to the Registries section.

## Checklist

- [ ] Resource is shadcn/ui related
- [ ] Registry is publicly accessible
- [ ] Link works
```

## Alternative: website submission

User can submit via https://awesome-shadcn-ui.vercel.app/ instead of a PR. Prefer PR when the user wants a traceable launch workflow.
