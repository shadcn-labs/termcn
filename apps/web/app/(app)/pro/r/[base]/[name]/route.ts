import { getProRegistryItem } from "@/lib/pro-registry";
import {
  authorizeRegistryRequest,
  registryAuthorizationError,
} from "@/lib/registry-license";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const supportedBases = new Set(["ink", "opentui"]);
const itemNamePattern = /^[a-z0-9-]+\.json$/u;
const responseHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization, X-License-Key",
};

export const GET = async (
  request: Request,
  { params }: { params: Promise<{ base: string; name: string }> }
) => {
  const authorization = await authorizeRegistryRequest(request);
  if (!authorization.authorized) {
    return registryAuthorizationError(authorization);
  }

  const { base, name } = await params;
  if (!supportedBases.has(base) || !itemNamePattern.test(name)) {
    return Response.json(
      { error: "registry_item_not_found", message: "Registry item not found." },
      { headers: responseHeaders, status: 404 }
    );
  }

  try {
    const item = await getProRegistryItem(
      `${base}/${name.replace(/\.json$/u, "")}`
    );
    if (!item) {
      return Response.json(
        {
          error: "registry_item_not_found",
          message: "Registry item not found.",
        },
        { headers: responseHeaders, status: 404 }
      );
    }
    return Response.json(item, { headers: responseHeaders });
  } catch (error) {
    console.error("Private registry item delivery failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return Response.json(
      {
        error: "registry_unavailable",
        message: "The private registry is temporarily unavailable.",
      },
      { headers: responseHeaders, status: 503 }
    );
  }
};
