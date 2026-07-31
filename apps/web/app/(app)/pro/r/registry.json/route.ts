import { getProRegistry } from "@/lib/pro-registry";
import {
  authorizeRegistryRequest,
  registryAuthorizationError,
} from "@/lib/registry-license";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "private, no-store",
  Vary: "Authorization, X-License-Key",
};

export const GET = async (request: Request) => {
  const authorization = await authorizeRegistryRequest(request);
  if (!authorization.authorized) {
    return registryAuthorizationError(authorization);
  }

  try {
    return Response.json(await getProRegistry(), { headers: responseHeaders });
  } catch (error) {
    console.error("Private registry index delivery failed", {
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
