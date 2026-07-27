import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { normalizeEmail } from "./lib/email";
import { accessPlan, accessTokenScope, licenseTier } from "./validators";

const inactivePurchaseStatuses = new Set([
  "cancelled",
  "disputed",
  "expired",
  "failed",
  "refunded",
  "revoked",
]);

const isPurchaseActive = (purchase: Doc<"purchases">) =>
  !inactivePurchaseStatuses.has(purchase.status.toLowerCase());

interface Entitlement {
  purchase: Doc<"purchases">;
  role: "member" | "owner";
}

const getEntitlements = async (
  ctx: QueryCtx,
  identity: { authId: string; email?: string }
): Promise<Entitlement[]> => {
  const normalizedEmail = identity.email
    ? normalizeEmail(identity.email)
    : undefined;
  const entitlements = new Map<string, Entitlement>();

  const addEntitlement = (
    purchase: Doc<"purchases"> | null,
    role: "member" | "owner"
  ) => {
    if (!purchase || !isPurchaseActive(purchase)) {
      return;
    }
    const existing = entitlements.get(purchase._id);
    if (!existing || role === "owner") {
      entitlements.set(purchase._id, { purchase, role });
    }
  };

  const addMembershipEntitlements = async (
    memberships: Doc<"licenseMembers">[]
  ) => {
    const activeMemberships = memberships.filter(
      (membership) => membership.status === "active"
    );
    const purchases = await Promise.all(
      activeMemberships.map(async (membership) => ({
        membership,
        purchase: await ctx.db.get(membership.purchaseId),
      }))
    );
    for (const { membership, purchase } of purchases) {
      addEntitlement(purchase, membership.role);
    }
  };

  if (normalizedEmail) {
    const purchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    for (const purchase of purchases) {
      addEntitlement(purchase, "owner");
    }

    const memberships = await ctx.db
      .query("licenseMembers")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    await addMembershipEntitlements(memberships);
  }

  const purchases = await ctx.db
    .query("purchases")
    .withIndex("by_auth_id", (q) => q.eq("authId", identity.authId))
    .collect();
  for (const purchase of purchases) {
    addEntitlement(purchase, "owner");
  }

  const memberships = await ctx.db
    .query("licenseMembers")
    .withIndex("by_auth_id", (q) => q.eq("authId", identity.authId))
    .collect();
  await addMembershipEntitlements(memberships);

  return [...entitlements.values()];
};

export const getCustomerByAuthId = internalQuery({
  args: { authId: v.string() },
  handler: async (ctx, { authId }) =>
    await ctx.db
      .query("billingCustomers")
      .withIndex("by_auth_id", (q) => q.eq("authId", authId))
      .unique(),
});

export const getCustomerByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) =>
    await ctx.db
      .query("billingCustomers")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
      .first(),
});

export const hasPurchaseForEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalizedEmail = normalizeEmail(email);
    const directPurchases = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    if (directPurchases.some(isPurchaseActive)) {
      return true;
    }

    const memberships = await ctx.db
      .query("licenseMembers")
      .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
      .collect();
    const memberPurchases = await Promise.all(
      memberships
        .filter((membership) => membership.status === "active")
        .map((membership) => ctx.db.get(membership.purchaseId))
    );
    return memberPurchases.some(
      (purchase) => purchase !== null && isPurchaseActive(purchase)
    );
  },
});

export const recordPaymentSucceeded = internalMutation({
  args: {
    amount: v.number(),
    authId: v.optional(v.string()),
    currency: v.string(),
    dodoCustomerId: v.string(),
    email: v.string(),
    paymentId: v.string(),
    plan: accessPlan,
    seatLimit: v.number(),
    status: v.string(),
    tier: licenseTier,
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const payment = { ...args, email: normalizedEmail };
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", args.paymentId))
      .unique();

    const purchaseId = purchase
      ? purchase._id
      : await ctx.db.insert("purchases", payment);
    if (purchase) {
      await ctx.db.patch(purchase._id, payment);
    }

    const owner = await ctx.db
      .query("licenseMembers")
      .withIndex("by_purchase_id_and_email", (q) =>
        q.eq("purchaseId", purchaseId).eq("email", normalizedEmail)
      )
      .unique();
    const ownerData = {
      addedAt: owner?.addedAt ?? Date.now(),
      authId: args.authId,
      email: normalizedEmail,
      purchaseId,
      role: "owner" as const,
      status: "active" as const,
    };
    await (owner
      ? ctx.db.patch(owner._id, { ...ownerData, revokedAt: undefined })
      : ctx.db.insert("licenseMembers", ownerData));

    const customer = args.authId
      ? await ctx.db
          .query("billingCustomers")
          .withIndex("by_auth_id", (q) => q.eq("authId", args.authId))
          .first()
      : await ctx.db
          .query("billingCustomers")
          .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
          .first();

    const customerData = {
      authId: args.authId,
      dodoCustomerId: args.dodoCustomerId,
      email: normalizedEmail,
    };

    await (customer
      ? ctx.db.patch(customer._id, customerData)
      : ctx.db.insert("billingCustomers", customerData));
  },
});

export const recordRefundSucceeded = internalMutation({
  args: { isPartial: v.boolean(), paymentId: v.string() },
  handler: async (ctx, { isPartial, paymentId }) => {
    if (isPartial) {
      return;
    }
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", paymentId))
      .unique();
    if (!purchase) {
      return;
    }
    await ctx.db.patch(purchase._id, { status: "refunded" });

    const tokens = await ctx.db
      .query("accessTokens")
      .withIndex("by_purchase_id", (q) => q.eq("purchaseId", purchase._id))
      .collect();
    await Promise.all(
      tokens
        .filter((token) => token.status === "active")
        .map((token) => ctx.db.patch(token._id, { status: "revoked" }))
    );
  },
});

export const recordLicenseKey = internalMutation({
  args: {
    dodoLicenseKeyId: v.string(),
    expiresAt: v.optional(v.number()),
    keyHash: v.string(),
    paymentId: v.string(),
    productId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const licenseKey = await ctx.db
      .query("licenseKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", args.keyHash))
      .unique();

    await (licenseKey
      ? ctx.db.patch(licenseKey._id, args)
      : ctx.db.insert("licenseKeys", args));
  },
});

export const getLicenseKeyByHash = internalQuery({
  args: { keyHash: v.string() },
  handler: async (ctx, { keyHash }) =>
    await ctx.db
      .query("licenseKeys")
      .withIndex("by_key_hash", (q) => q.eq("keyHash", keyHash))
      .unique(),
});

export const getEntitlementForIdentity = internalQuery({
  args: {
    authId: v.string(),
    email: v.optional(v.string()),
    purchaseId: v.optional(v.id("purchases")),
    scope: accessTokenScope,
  },
  handler: async (ctx, { authId, email, purchaseId, scope }) => {
    const entitlements = await getEntitlements(ctx, { authId, email });
    const entitlement = entitlements.find(
      ({ purchase }) =>
        (!purchaseId || purchase._id === purchaseId) &&
        (scope === "registry" ? purchase.plan === "bundle" : true)
    );
    if (!entitlement) {
      return null;
    }
    return {
      email: normalizeEmail(email ?? entitlement.purchase.email),
      plan: entitlement.purchase.plan,
      purchaseId: entitlement.purchase._id,
      role: entitlement.role,
      seatLimit: entitlement.purchase.seatLimit ?? 1,
      tier: entitlement.purchase.tier ?? "personal",
    };
  },
});

export const getCurrentAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const entitlements = await getEntitlements(ctx, {
      authId: identity.tokenIdentifier,
      email: identity.email,
    });
    const hasBundle = entitlements.some(
      ({ purchase }) => purchase.plan === "bundle"
    );
    const hasSkill =
      hasBundle ||
      entitlements.some(({ purchase }) => purchase.plan === "skill");
    if (!hasSkill) {
      return null;
    }

    return {
      entitlements: entitlements.map(({ purchase, role }) => ({
        plan: purchase.plan,
        purchaseId: purchase._id,
        role,
        seatLimit: purchase.seatLimit ?? 1,
        teamName: purchase.teamName,
        tier: purchase.tier ?? ("personal" as const),
      })),
      plan: hasBundle ? ("bundle" as const) : ("skill" as const),
      products: { bundle: hasBundle, skill: hasSkill },
    };
  },
});
