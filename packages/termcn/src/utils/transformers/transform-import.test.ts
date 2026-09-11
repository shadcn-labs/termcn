import { describe, expect, it } from "vitest";

import { createConfig } from "@/src/utils/get-config";
import { transform } from "@/src/utils/transformers";

const config = createConfig({
  framework: "ink",
  aliases: {
    components: "@app/components",
    ui: "@app/ui",
    lib: "@app/lib",
    hooks: "@app/hooks",
    providers: "@app/providers",
    themes: "@app/themes",
  },
});

describe("transformImport", () => {
  it("maps authored registry kinds to consumer aliases", async () => {
    const result = await transform({
      config,
      filename: "component.tsx",
      raw: `
import { Button } from "@/registry/bases/ink/ui/button"
import { helper } from "@/registry/bases/ink/lib/helper"
import { useTheme } from "@/registry/bases/ink/hooks/use-theme"
`,
    });

    expect(result).toContain('from "@app/ui/button"');
    expect(result).toContain('from "@app/lib/helper"');
    expect(result).toContain('from "@app/hooks/use-theme"');
  });

  it("maps theme and provider imports", async () => {
    const result = await transform({
      config,
      filename: "component.tsx",
      raw: `
import { draculaTheme } from "@/registry/bases/ink/themes/dracula"
import { ThemeProvider } from "@/registry/bases/ink/providers/theme-provider"
`,
    });

    expect(result).toContain('from "@app/themes/dracula"');
    expect(result).toContain('from "@app/providers/theme-provider"');
  });

  it("maps consumer-form aliases from registry files", async () => {
    const result = await transform({
      config,
      filename: "component.tsx",
      raw: `
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/providers/theme-provider"
import { draculaTheme } from "@/lib/terminal-themes/dracula"
`,
    });

    expect(result).toContain('from "@app/ui/button"');
    expect(result).toContain('from "@app/providers/theme-provider"');
    expect(result).toContain('from "@app/themes/dracula"');
  });

  it("leaves external and relative imports unchanged", async () => {
    const raw = `import React from "react"\nimport { local } from "./local"\n`;

    await expect(
      transform({ config, filename: "component.ts", raw })
    ).resolves.toBe(raw);
  });

  it("does not transform non-code files", async () => {
    const raw = 'import { Button } from "@/registry/bases/ink/ui/button"';

    await expect(
      transform({ config, filename: "styles.css", raw })
    ).resolves.toBe(raw);
  });

  it("derives omitted aliases from the components root", async () => {
    const fallbackConfig = createConfig({
      aliases: { components: "~/src/components" },
    });
    const result = await transform({
      config: fallbackConfig,
      filename: "component.ts",
      raw: `
import { Button } from "@/registry/bases/ink/ui/button"
import { theme } from "@/registry/bases/ink/themes/dracula"
`,
    });

    expect(result).toContain('from "~/src/components/ui/button"');
    expect(result).toContain('from "~/src/lib/terminal-themes/dracula"');
  });
});
