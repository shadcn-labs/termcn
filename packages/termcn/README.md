# termcn

The CLI for building terminal interfaces with the termcn Ink and OpenTUI
registries.

## Initialize a project

Run the interactive initializer:

```bash
npx termcn@latest init
```

Or choose a framework, terminal theme, and starter template directly:

```bash
npx termcn@latest init \
  --framework ink \
  --theme dracula \
  --template app-shell \
  --name my-terminal-app \
  --yes
```

The initializer creates a shadcn-compatible `components.json`, installs the
selected terminal theme and template, and scaffolds a runnable Ink or OpenTUI
entry point when used in an empty directory.

## Add components

```bash
npx termcn@latest add button
```

The active framework in `components.json` determines whether the component is
loaded from the Ink or OpenTUI registry.

## Attribution

The registry, schema, resolver, build, and update infrastructure is derived
from the MIT-licensed
[shadcn CLI](https://github.com/shadcn-ui/ui/tree/main/packages/shadcn).
See [LICENSE](./LICENSE).
