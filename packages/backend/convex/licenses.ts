"use node";

import { randomBytes } from "node:crypto";

import { v } from "convex/values";
import { DodoPayments } from "dodopayments";

import { internal } from "./_generated/api";
import { action, env } from "./_generated/server";
import type { ActionCtx } from "./_generated/server";
import { hashLicenseKey } from "./lib/license";
import { accessTokenScope } from "./validators";

const REGISTRY_TOKEN_TTL = 24 * 60 * 60 * 1000;
const SKILL_TOKEN_TTL = 10 * 60 * 1000;
const CI_TOKEN_TTL = 30 * 24 * 60 * 60 * 1000;

const normalizeName = (name: string | undefined) => {
  const normalized = name?.trim();
  if (normalized && normalized.length > 80) {
    throw new Error("Token name must be 80 characters or fewer");
  }
  return normalized || undefined;
};

const createToken = (prefix: string) =>
  `${prefix}_${randomBytes(32).toString("base64url")}`;

export const issueAccessToken = action({
  args: {
    name: v.optional(v.string()),
    purchaseId: v.optional(v.id("purchases")),
    scope: accessTokenScope,
  },
  handler: async (ctx, { name, purchaseId, scope }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }
    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForIdentity,
      {
        authId: identity.tokenIdentifier,
        email: identity.email,
        ...(purchaseId ? { purchaseId } : {}),
        scope,
      }
    );
    if (!entitlement) {
      throw new Error(
        scope === "registry"
          ? "Registry access is not included with this license"
          : "Skill access is not included with this license"
      );
    }

    const token = createToken(
      scope === "registry" ? "termcn_reg" : "termcn_skill"
    );
    const expiresAt =
      Date.now() +
      (scope === "registry" ? REGISTRY_TOKEN_TTL : SKILL_TOKEN_TTL);
    const tokenName = normalizeName(name);
    await ctx.runMutation(internal["access-tokens"].store, {
      authId: identity.tokenIdentifier,
      email: entitlement.email,
      expiresAt,
      kind: "member",
      ...(tokenName ? { name: tokenName } : {}),
      purchaseId: entitlement.purchaseId,
      scope,
      tokenHash: await hashLicenseKey(token),
      tokenPrefix: token.slice(0, 18),
    });
    return { expiresAt, scope, token };
  },
});

export const issueCiToken = action({
  args: { name: v.string(), purchaseId: v.id("purchases") },
  handler: async (ctx, { name, purchaseId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }
    const entitlement = await ctx.runQuery(
      internal.billing.getEntitlementForIdentity,
      {
        authId: identity.tokenIdentifier,
        email: identity.email,
        purchaseId,
        scope: "registry",
      }
    );
    if (
      !entitlement ||
      entitlement.role !== "owner" ||
      entitlement.tier !== "team"
    ) {
      throw new Error("Only a Team Bundle owner can create CI tokens");
    }

    const token = createToken("termcn_ci");
    const expiresAt = Date.now() + CI_TOKEN_TTL;
    const tokenName = normalizeName(name);
    if (!tokenName) {
      throw new Error("Enter a name for the CI token");
    }
    await ctx.runMutation(internal["access-tokens"].store, {
      authId: identity.tokenIdentifier,
      email: entitlement.email,
      expiresAt,
      kind: "ci",
      name: tokenName,
      purchaseId: entitlement.purchaseId,
      scope: "registry",
      tokenHash: await hashLicenseKey(token),
      tokenPrefix: token.slice(0, 18),
    });
    return { expiresAt, scope: "registry" as const, token };
  },
});

const validateIssuedToken = async (
  ctx: Pick<ActionCtx, "runMutation" | "runQuery">,
  token: string,
  scope: "registry" | "skill"
) => {
  const now = Date.now();
  const result = await ctx.runQuery(internal["access-tokens"].validate, {
    now,
    scope,
    tokenHash: await hashLicenseKey(token),
  });
  if (!result) {
    return false;
  }
  if (result.shouldTouch) {
    await ctx.runMutation(internal["access-tokens"].touch, {
      now,
      tokenId: result.tokenId,
    });
  }
  return true;
};

export const validateRegistryLicense = action({
  args: { licenseKey: v.string() },
  handler: async (ctx, { licenseKey }) => {
    const trimmedKey = licenseKey.trim();
    if (trimmedKey.length < 8 || trimmedKey.length > 512) {
      return false;
    }
    if (await validateIssuedToken(ctx, trimmedKey, "registry")) {
      return true;
    }

    const storedKey = await ctx.runQuery(internal.billing.getLicenseKeyByHash, {
      keyHash: await hashLicenseKey(trimmedKey),
    });
    if (
      !storedKey ||
      storedKey.productId !== env.DODO_BUNDLE_PRODUCT_ID ||
      storedKey.status !== "active" ||
      (storedKey.expiresAt !== undefined && storedKey.expiresAt <= Date.now())
    ) {
      return false;
    }

    try {
      const dodo = new DodoPayments({
        bearerToken: env.DODO_PAYMENTS_API_KEY,
        environment: env.DODO_PAYMENTS_ENVIRONMENT,
      });
      const result = await dodo.licenses.validate({
        license_key: trimmedKey,
      });
      return result.valid;
    } catch (error) {
      console.error("Dodo license validation failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
    }
  },
});

export const validateSkillToken = action({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const trimmedToken = token.trim();
    if (trimmedToken.length < 8 || trimmedToken.length > 512) {
      return false;
    }
    return await validateIssuedToken(ctx, trimmedToken, "skill");
  },
});
