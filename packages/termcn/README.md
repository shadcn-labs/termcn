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
  --font jetbrains-mono \
  --icons codicons \
  --template app-shell \
  --name my-terminal-app \
  --yes
```

The initializer creates a shadcn-compatible `components.json`, installs the
selected terminal theme and template, and scaffolds a runnable Ink or OpenTUI
entry point when used in an empty directory.

## Nerd Fonts and icons

`termcn init` supports four terminal-safe Nerd Font Mono families and four
official Nerd Fonts glyph sets:

- Fonts: JetBrains Mono, Fira Code, Hack, and Meslo.
- Icons: Codicons, Font Awesome, Material Design Icons, and Octicons.

The selected values are written to `components.json`. The initializer also
generates `src/lib/nerd-font.ts` and a renderer-specific
`src/components/ui/nerd-icon.tsx` for Ink or OpenTUI.

Terminal applications cannot change the terminal emulator's active font.
Install the chosen family and select its **Nerd Font Mono** variant in your
terminal settings. The Mono variants keep every icon constrained to a single
terminal cell, as recommended by Nerd Fonts.

Download a release archive:

```bash
curl -OL https://github.com/ryanoasis/nerd-fonts/releases/download/v3.4.0/JetBrainsMono.tar.xz
```

Or install with Homebrew:

```bash
brew install --cask font-jetbrains-mono-nerd-font
```

Glyph codepoints are sourced from Nerd Fonts v3.4.0's official
`glyphnames.json`.

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
