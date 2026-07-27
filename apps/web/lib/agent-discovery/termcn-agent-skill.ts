import { createHash } from "node:crypto";

import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

export const TERMCN_AGENT_SKILL_MD = `# ${SITE.NAME} — terminal UI component registry

## Summary

Help users initialize Ink and OpenTUI projects and add **${SITE.NAME}** components with the termcn CLI, then navigate the documentation site.

## Registry

- Registry JSON: \`/r/registry.json\` (shadcn-compatible schema)
- Docs: ${ROUTES.DOCS_REGISTRY}
- MCP docs: ${ROUTES.DOCS_MCP}

## Install

\`\`\`bash
npx termcn@latest init
npx termcn@latest add badge
\`\`\`

Prefer following the on-site installation guide: ${ROUTES.DOCS_INSTALLATION}

## When answering

- Prefer linking to \`${ROUTES.DOCS}\` sections over guessing props.
- Components live under Ink and OpenTUI namespaces in the docs.
`;

export const termcnAgentSkillDigest = (): string => {
  const hex = createHash("sha256")
    .update(TERMCN_AGENT_SKILL_MD, "utf-8")
    .digest("hex");

  return `sha256:${hex}`;
};
