import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";
import { homeContentRoute } from "@/lib/docs";

const PROFILE = "https://www.rfc-editor.org/info/rfc9727";

const catalogLinkset = (origin: string) => {
  const base = origin.replace(/\/$/, "");

  return {
    linkset: [
      {
        anchor: `${base}/`,
        "api-catalog": [
          {
            href: `${base}${ROUTES.API_CATALOG}`,
            type: `application/linkset+json; profile="${PROFILE}"`,
          },
        ],
        describedby: [
          {
            href: `${base}${ROUTES.AGENT_SKILLS_INDEX}`,
            type: "application/json",
          },
          {
            href: `${base}${ROUTES.AGENT_SKILLS_TERMCN_SKILL}`,
            type: "text/markdown",
          },
        ],
        "service-desc": [
          { href: `${base}${ROUTES.OPENAPI}`, type: "application/json" },
        ],
        "service-doc": [
          { href: `${base}${ROUTES.DOCS}`, type: "text/html" },
          { href: `${base}${ROUTES.LLMS}`, type: "text/plain" },
          { href: `${base}${ROUTES.LLMS_FULL}`, type: "text/plain" },
          { href: `${base}${homeContentRoute}`, type: "text/markdown" },
          {
            href: LINK.SHADCN_MCP_DOCS,
            title: "shadcn MCP server",
            type: "text/html",
          },
        ],
        status: [
          { href: `${base}${ROUTES.API_STATUS}`, type: "application/json" },
        ],
      },
      {
        anchor: `${base}${ROUTES.REGISTRY_INDEX}`,
        "service-desc": [
          { href: `${base}${ROUTES.OPENAPI}`, type: "application/json" },
        ],
        "service-doc": [
          { href: `${base}${ROUTES.DOCS_REGISTRY}`, type: "text/html" },
        ],
        status: [
          { href: `${base}${ROUTES.API_STATUS}`, type: "application/json" },
        ],
      },
    ],
  };
};

export const GET = (request: Request) => {
  const origin = requestOrigin(request);
  const body = JSON.stringify(catalogLinkset(origin));

  return new Response(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
      "Content-Type": `application/linkset+json; profile="${PROFILE}"`,
    },
  });
};

export const HEAD = (_request: Request) => {
  const profile = `application/linkset+json; profile="${PROFILE}"`;

  return new Response(null, {
    headers: {
      "Content-Type": profile,
      Link: `<${ROUTES.API_CATALOG}>; rel="api-catalog"`,
    },
  });
};
