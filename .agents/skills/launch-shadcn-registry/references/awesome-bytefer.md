# bytefer/awesome-shadcn-ui

**Repo:** https://github.com/bytefer/awesome-shadcn-ui  
**File:** `README.md`

## Section selection

| Registry type | Section |
|---------------|---------|
| Component/block registry | **UI Libs** |
| Dev tool / generator | **Tools** |
| Starter template | **Templates** |

Default to **UI Libs** for shadcn registries.

## Row format

```markdown
| Display Name | <description — one sentence> | <homepage> |
```

No date column. Link is a plain URL, not markdown.

### Example

```markdown
| OG Image CN | Beautiful OG images, made simple. Ready to use, customizable Open Graph image components for React. | https://ogimagecn.vercel.app/ |
```

### Field rules

| Column | Source |
|--------|--------|
| Name | `profile.name` |
| Description | `profile.description` |
| Link | `profile.homepage` (full URL) |

Insert alphabetically by name within the chosen section if sorted; otherwise append.

## PR details

**Title:** `docs: add <name>`  
**Body:**

```markdown
Adds <name> to the <section> section.

Homepage: <homepage>
GitHub: <githubUrl>
```

## Note on dual awesome lists

birobirobiro's list is more actively maintained (dated entries, dedicated Registries section). Submit to both when doing a full launch, but set expectations that bytefer's list may merge slower.
