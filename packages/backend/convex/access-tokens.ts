import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { normalizeEmail } from "./lib/email";
import { accessTokenScope } from "./validators";

const INACTIVE_PURCHASE_STATUSES = new Set([
  "cancelled",
  "disputed",
  "expired",
  "failed",
  "refunded",
  "revoked",
]);

const isPurchaseActive = (
  purchase: Doc<"purchases"> | null
): purchase is Doc<"purchases"> =>
  purchase !== null &&
  !INACTIVE_PURCHASE_STATUSES.has(purchase.status.toLowerCase());

const hasMemberAccess = async (
  ctx: Pick<QueryCtx, "db">,
  purchase: Doc<"purchases">,
  email: string,
  requireOwner: boolean
) => {
  if (purchase.email === email) {
    return true;
  }
  const membership = await ctx.db
    .query("licenseMembers")
    .withIndex("by_purchase_id_and_email", (q) =>
      q.eq("purchaseId", purchase._id).eq("email", email)
    )
    .unique();
  return (
    membership?.status === "active" &&
    (!requireOwner || membership.role === "owner")
  );
};

export const store = internalMutation({
  args: {
    authId: v.string(),
    email: v.string(),
    expiresAt: v.number(),
    kind: v.union(v.literal("member"), v.literal("ci")),
    name: v.optional(v.string()),
    purchaseId: v.id("purchases"),
    scope: accessTokenScope,
    tokenHash: v.string(),
    tokenPrefix: v.string(),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db.get(args.purchaseId);
    if (!isPurchaseActive(purchase)) {
      throw new Error("License is inactive");
    }
    if (args.scope === "registry" && purchase.plan !== "bundle") {
      throw new Error("This license does not include registry access");
    }
    const email = normalizeEmail(args.email);
    const authorized = await hasMemberAccess(
      ctx,
      purchase,
      email,
      args.kind === "ci"
    );
    if (!authorized) {
      throw new Error("Unauthorized");
    }

    const membership = await ctx.db
      .query("licenseMembers")
      .withIndex("by_purchase_id_and_email", (q) =>
        q.eq("purchaseId", args.purchaseId).eq("email", email)
      )
      .unique();
    if (membership?.status === "active" && !membership.authId) {
      await ctx.db.patch(membership._id, { authId: args.authId });
    }

    const tokens = await ctx.db
      .query("accessTokens")
      .withIndex("by_purchase_id_and_email", (q) =>
        q.eq("purchaseId", args.purchaseId).eq("email", email)
      )
      .collect();
    const activeTokens = tokens.filter(
      (token) =>
        token.status === "active" &&
        token.expiresAt > Date.now() &&
        token.kind === args.kind &&
        token.scope === args.scope
    );
    const limit = args.kind === "ci" ? 2 : 5;
    if (activeTokens.length >= limit) {
      throw new Error(
        `Revoke an existing ${args.kind === "ci" ? "CI" : "member"} token before creating another`
      );
    }

    return await ctx.db.insert("accessTokens", {
      createdAt: Date.now(),
      email,
      expiresAt: args.expiresAt,
      kind: args.kind,
      ...(args.name ? { name: args.name } : {}),
      purchaseId: args.purchaseId,
      scope: args.scope,
      status: "active",
      tokenHash: args.tokenHash,
      tokenPrefix: args.tokenPrefix,
    });
  },
});

export const validate = internalQuery({
  args: {
    now: v.number(),
    scope: accessTokenScope,
    tokenHash: v.string(),
  },
  handler: async (ctx, { now, scope, tokenHash }) => {
    const token = await ctx.db
      .query("accessTokens")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .unique();
    if (
      !token ||
      token.status !== "active" ||
      token.scope !== scope ||
      token.expiresAt <= now
    ) {
      return null;
    }
    const purchase = await ctx.db.get(token.purchaseId);
    if (
      !isPurchaseActive(purchase) ||
      (scope === "registry" && purchase.plan !== "bundle")
    ) {
      return null;
    }
    const authorized = await hasMemberAccess(
      ctx,
      purchase,
      token.email,
      token.kind === "ci"
    );
    if (!authorized) {
      return null;
    }
    return {
      expiresAt: token.expiresAt,
      kind: token.kind,
      plan: purchase.plan,
      purchaseId: purchase._id,
      shouldTouch: !token.lastUsedAt || now - token.lastUsedAt > 5 * 60 * 1000,
      tokenId: token._id,
    };
  },
});

export const touch = internalMutation({
  args: { now: v.number(), tokenId: v.id("accessTokens") },
  handler: async (ctx, { now, tokenId }) => {
    const token = await ctx.db.get(tokenId);
    if (
      token?.status === "active" &&
      (!token.lastUsedAt || now - token.lastUsedAt > 5 * 60 * 1000)
    ) {
      await ctx.db.patch(tokenId, { lastUsedAt: now });
    }
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return [];
    }
    const tokens = await ctx.db
      .query("accessTokens")
      .withIndex("by_email", (q) =>
        q.eq("email", normalizeEmail(identity.email ?? ""))
      )
      .order("desc")
      .collect();
    return tokens.map((token) => ({
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      id: token._id,
      kind: token.kind,
      lastUsedAt: token.lastUsedAt,
      name: token.name,
      scope: token.scope,
      status: token.status,
      tokenPrefix: token.tokenPrefix,
    }));
  },
});

export const revokeMine = mutation({
  args: { tokenId: v.id("accessTokens") },
  handler: async (ctx, { tokenId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      throw new Error("Not authenticated");
    }
    const token = await ctx.db.get(tokenId);
    if (!token) {
      throw new Error("Access token not found");
    }
    const email = normalizeEmail(identity.email);
    const purchase = await ctx.db.get(token.purchaseId);
    const canRevoke =
      token.email === email ||
      Boolean(purchase && (await hasMemberAccess(ctx, purchase, email, true)));
    if (!canRevoke) {
      throw new Error("Unauthorized");
    }
    await ctx.db.patch(tokenId, { status: "revoked" });
    return { revoked: true };
  },
});
