#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core"
import { createRoot } from "@opentui/react"

import { ThemeProvider } from "@/providers/theme-provider"
import { {{themeExport}} } from "@/lib/terminal-themes/{{theme}}"

function App() {
  return (
    <ThemeProvider theme={{{themeExport}}}>
      <box
        alignItems="center"
        border
        borderColor={{{themeExport}}.colors.border}
        flexDirection="column"
        height="100%"
        justifyContent="center"
        width="100%"
      >
        <text fg={{{themeExport}}.colors.primary}>Welcome to termcn</text>
        <text fg={{{themeExport}}.colors.mutedForeground}>
          Edit src/index.tsx to start building.
        </text>
      </box>
    </ThemeProvider>
  )
}

const renderer = await createCliRenderer({ exitOnCtrlC: true })
createRoot(renderer).render(<App />)
