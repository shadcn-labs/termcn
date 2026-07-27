import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { homeContentRoute } from "@/lib/docs";

export const buildOpenApiDocument = (
  origin: string
): Record<string, unknown> => {
  const base = origin.replace(/\/$/, "");

  return {
    info: {
      description: `Read-only HTTP surfaces for the ${SITE.NAME} documentation site and shadcn component registry.`,
      title: "termcn public HTTP API",
      version: "0.1.0",
    },
    openapi: "3.0.3",
    paths: {
      [ROUTES.AGENT_SKILLS_INDEX]: {
        get: {
          responses: {
            "200": { description: "Agent skills index" },
          },
          summary: "Agent skills discovery index",
        },
      },
      [ROUTES.AGENT_SKILLS_TERMCN_SKILL]: {
        get: {
          responses: {
            "200": { description: "Agent skill markdown" },
          },
          summary: "termcn agent skill markdown",
        },
      },
      [ROUTES.API_CATALOG]: {
        get: {
          responses: {
            "200": { description: "API catalog linkset" },
          },
          summary: "Machine-readable API catalog",
        },
        head: {
          responses: {
            "200": { description: "API catalog headers" },
          },
          summary: "API catalog headers",
        },
      },
      [ROUTES.API_STATUS]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: {
                    properties: { status: { example: "ok", type: "string" } },
                    type: "object",
                  },
                },
              },
              description: "OK",
            },
          },
          summary: "Service health",
        },
      },
      [ROUTES.LLMS_FULL]: {
        get: {
          responses: {
            "200": { description: "Plain text bundle" },
          },
          summary: "Full LLM-oriented documentation export",
        },
      },
      [ROUTES.LLMS]: {
        get: {
          responses: {
            "200": { description: "Plain text index" },
          },
          summary: "LLM-oriented documentation index",
        },
      },
      [ROUTES.OPENAPI]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "OpenAPI JSON",
            },
          },
          summary: "This OpenAPI document",
        },
      },
      [ROUTES.REGISTRY_INDEX]: {
        get: {
          responses: {
            "200": {
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
              description: "Registry manifest",
            },
          },
          summary: "shadcn/ui component registry index",
        },
      },
      [ROUTES.DOCS]: {
        get: {
          responses: {
            "200": { description: "HTML documentation" },
          },
          summary: "Documentation (HTML)",
        },
      },
      [homeContentRoute]: {
        get: {
          responses: {
            "200": { description: "Homepage markdown export" },
          },
          summary: "Homepage markdown export",
        },
        head: {
          responses: {
            "200": { description: "Homepage markdown headers" },
          },
          summary: "Homepage markdown headers",
        },
      },
    },
    servers: [{ url: base }],
  };
};
