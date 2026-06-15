# Hacker News — Show HN

**Posting:** Manual only at https://news.ycombinator.com/submit  
**Format:** Show HN posts only for things you built and can discuss.

## Title template

```
Show HN: {Name} – {concrete benefit, no hype}
```

### Good titles

```
Show HN: OG Image CN – shadcn registry for Open Graph image components
```

```
Show HN: TermCN – terminal-styled React components for the shadcn CLI
```

### Bad titles (avoid)

```
Show HN: The best shadcn component library ever
```

```
Show HN: My new startup's UI kit
```

## First comment (author)

Post immediately after submission as a comment on your thread:

```markdown
Hi HN — I'm {githubUsername}, author of {name}.

I built this because {specific problem in 1–2 sentences}.

It's a shadcn/ui registry: components install via CLI and live in your repo as source. Index: {registryBaseUrl}/registry.json

Try it:
{installExample}

Source: {githubUrl}
Site: {homepage}

Happy to answer questions about {technical topic: registry format, OG image generation, a11y, etc.}.
```

## Guidelines

- **Substance over promotion** — HN penalizes marketing speak
- **Be present** — reply to comments for the first few hours
- **Best time** — weekday mornings US time (rough guide, not a rule)
- **No voting rings** — never ask for upvotes
- **YC association** — only mention if true; don't fake a Show HN for repackaged content
- **Open source** — link GitHub prominently if OSS

## When not to post Show HN

- Registry is not yet live (`registry.json` fails)
- It's a thin wrapper with no original work
- User only wants directory listings, not HN exposure
