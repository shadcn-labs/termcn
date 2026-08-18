# Contributing to termcn

Thanks for your interest in contributing! This guide covers everything you need to get the repo running locally and land a change.

## Prerequisites

- **Node.js 20+**
- **pnpm** — version pinned in [`package.json`](./package.json)

## Getting started

```bash
git clone https://github.com/shadcn-labs/termcn.git
cd termcn
pnpm install
```

## Development

```bash
pnpm dev
```

This starts the Next.js dev server with the documentation site at [http://localhost:3000](http://localhost:3000).

## Building

```bash
pnpm build
```

This builds the shadcn registry first, then the Next.js app.

## Testing

```bash
pnpm typecheck     # TypeScript type checking
```

## Linting and formatting

```bash
pnpm check         # lint and format check (ultracite)
pnpm fix           # auto-fix lint and format issues
```

All of these run in CI, so running them locally before pushing saves a round trip.

A pre-commit hook via [lefthook](https://github.com/evilmartians/lefthook) automatically runs `pnpm fix` on staged files.

## Before opening a pull request

Every pull request must be tied to an issue. Before opening a PR, search the existing issues, discussions, and pull requests so you do not duplicate active work. If there is no existing issue, open one with the relevant template and describe the problem, use case, or bug reproduction.

For non-trivial changes, wait for discussion on the issue before investing in the implementation. The goal is to agree that the problem is real and that the proposed direction fits termcn before review shifts to code.

To avoid PRs that are unlikely to be reviewed or merged:

- Do not send broad rewrites, style-only churn, or formatting-only changes unless a maintainer asked for them.
- Do not bundle unrelated fixes or refactors into one PR. Split them so each PR has one reviewable purpose.
- Do not change public behavior based only on a hypothetical use case. Include a concrete user story, reproduction, or test that shows the need.
- Do not claim an issue silently. Comment before starting work, and check the thread first in case someone else is already working on it.

## Submitting a pull request

1. Fork the repo and create a branch from `main`.
2. Link the issue where the change was discussed and agreed on.
3. Make your change, including tests and docs where relevant.
4. Sign off every commit with `git commit -s`.
5. Make sure `pnpm check` and `pnpm typecheck` pass.
6. Open the PR with a clear description of the problem and solution.

## Developer Certificate of Origin (DCO)

All contributions are made under the [Developer Certificate of Origin](https://developercertificate.org/). Every commit must include a `Signed-off-by` line matching the commit author's name and email:

```text
Signed-off-by: Jane Doe <jane.doe@example.com>
```

Add it automatically with:

```bash
git commit -s -m "your commit message"
```

If you forget, amend the last commit:

```bash
git commit --amend -s --no-edit
```

To sign off a series of commits, rebase with `--signoff`:

```bash
git rebase --signoff main
```

## Reporting bugs and requesting features

Please use the [issue templates](https://github.com/shadcn-labs/termcn/issues/new/choose). For security issues, **do not open a public issue** — follow [SECURITY.md](./SECURITY.md) instead.

## Code of conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## License

termcn is licensed under the [MIT License](./LICENSE). By contributing, you agree that your contributions will be licensed under that same license (inbound = outbound).
