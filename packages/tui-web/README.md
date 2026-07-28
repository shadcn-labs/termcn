# @termcn/tui-web

Render Ink or OpenTUI React components in a browser terminal with one
runtime-aware API.

```tsx
import { inkComponent, openTuiComponent, TuiWeb } from "@termcn/tui-web";

const component =
  runtime === "ink"
    ? inkComponent(<InkApp />)
    : openTuiComponent(<OpenTuiApp />);

export const Preview = () => (
  <TuiWeb component={component} rows={18} theme={theme} />
);
```

Pass `themeProvider` when the rendered component reads a framework-specific
theme context. The terminal host always uses `theme.colors.background` and
`theme.colors.foreground`; Ink also uses optional selection colors.

Next.js consumers can import `createDynamicTerminal` from
`@termcn/tui-web/next` to load `TuiWeb` without server-side terminal setup.
