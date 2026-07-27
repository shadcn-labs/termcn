import { buildOpenApiDocument } from "@/lib/agent-discovery/openapi-document";
import { requestOrigin } from "@/lib/agent-discovery/request-origin";

export const GET = (request: Request) => {
  const origin = requestOrigin(request);
  const doc = buildOpenApiDocument(origin);

  return Response.json(doc, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
};
