import { api } from "@termcn/backend/convex/_generated/api";
import "server-only";
import { fetchAuthAction } from "@/lib/auth-server";

export type RegistryAuthorization =
  | { authorized: true }
  | { authorized: false; message: string; status: 401 | 403 | 503 };

export const authorizeRegistryRequest = async (
  request: Request
): Promise<RegistryAuthorization> => {
  const authorization = request.headers.get("authorization");
  const [scheme, ...credentials] = authorization?.trim().split(/\s+/u) ?? [];
  const bearerToken =
    scheme?.toLowerCase() === "bearer" ? credentials.join(" ") : undefined;
  const accessCredential =
    bearerToken || request.headers.get("x-license-key")?.trim();

  if (!accessCredential) {
    return {
      authorized: false,
      message: "A termcn Pro registry token is required.",
      status: 401,
    };
  }

  try {
    const valid = await fetchAuthAction(api.licenses.validateRegistryLicense, {
      licenseKey: accessCredential,
    });
    return valid
      ? { authorized: true }
      : {
          authorized: false,
          message: "The termcn Pro registry token is invalid or expired.",
          status: 403,
        };
  } catch (error) {
    console.error("Registry token authorization failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      authorized: false,
      message: "Registry token validation is temporarily unavailable.",
      status: 503,
    };
  }
};

export const registryAuthorizationError = (
  authorization: Exclude<RegistryAuthorization, { authorized: true }>
) =>
  Response.json(
    { error: "registry_access_denied", message: authorization.message },
    {
      headers: {
        "Cache-Control": "no-store",
        "WWW-Authenticate": 'Bearer realm="termcn-pro-registry"',
      },
      status: authorization.status,
    }
  );
