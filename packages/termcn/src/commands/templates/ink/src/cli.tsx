#!/usr/bin/env node
import React from "react"
import { Box, render, Text } from "ink"

import { ThemeProvider } from "@/providers/theme-provider"
import { {{themeExport}} } from "@/lib/terminal-themes/{{theme}}"

function App() {
  return (
    <ThemeProvider theme={{{themeExport}}}>
      <Box
        alignItems="center"
        borderColor={{{themeExport}}.colors.border}
        borderStyle="round"
        flexDirection="column"
        paddingX={2}
        paddingY={1}
      >
        <Text color={{{themeExport}}.colors.primary}>Welcome to termcn</Text>
        <Text color={{{themeExport}}.colors.mutedForeground}>
          Edit src/cli.tsx to start building.
        </Text>
      </Box>
    </ThemeProvider>
  )
}

render(<App />)
