import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { markdownResponse } from "@/lib/api";

export const revalidate = false;

const homepageMarkdown = (origin: string): string => {
  const base = origin.replace(/\/$/, "");

  return `# ${SITE.NAME}

${SITE.DESCRIPTION.LONG}

## Quick links

- [Get started](${base}${ROUTES.DOCS_INSTALLATION}.md)
- [Browse components](${base}${ROUTES.DOCS_COMPONENTS}.md)
- [Documentation](${base}${ROUTES.DOCS}.md)
- [Registry docs](${base}${ROUTES.DOCS_REGISTRY}.md)
- [LLM index (llms.txt)](${base}${ROUTES.LLMS})
- [API catalog](${base}${ROUTES.API_CATALOG})
- [OpenAPI description](${base}${ROUTES.OPENAPI})
- [Agent skills index](${base}${ROUTES.AGENT_SKILLS_INDEX})
`;
};

export const GET = (request: Request) => {
  const body = homepageMarkdown(requestOrigin(request));

  return markdownResponse(body, true);
};

export const HEAD = (request: Request) => {
  const body = homepageMarkdown(requestOrigin(request));

  return markdownResponse(body, false);
};
