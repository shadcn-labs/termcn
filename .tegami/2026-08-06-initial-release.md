---
packages:
  "termcn": minor
---

## Initial terminal CLI release

termcn 0.1.0 is the first public release of the terminal CLI for Ink and OpenTUI component registries.

### Core commands

- `termcn init` — scaffold a new terminal project with Ink or OpenTUI
- `termcn add` — install components from configured registries
- `termcn search` — fuzzy-search across all configured registries
- `termcn build` — build a local registry for distribution
- `termcn view` — inspect a registry item's files and metadata
- `termcn docs` — open component documentation in the browser
- `termcn mcp` — run an MCP server for AI assistant integration

### Registry support

- Namespaced registries (`@scope/name`), URL registries, and local file registries
- Multi-registry search with concurrency capping and error isolation
- Universal registry items (`registry:item`, `registry:file`) that work without framework detection
- Registry validation, include resolution, and duplicate detection

### Configuration

- `components.json` with `style`, `tsx`, `aliases`, `registries`, `theme`, `template`
- Monorepo-aware with workspace pattern detection (pnpm, npm/yarn workspaces)
- Path alias resolution via `tsconfig.json`
