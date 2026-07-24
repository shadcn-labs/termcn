import { v } from "convex/values";

import { internalMutation, internalQuery, query } from "./_generated/server";
import { normalizeEmail } from "./lib/email";
import { accessPlan } from "./validators";

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
  handler: async (ctx, { email }) =>
    (await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", normalizeEmail(email)))
      .first()) !== null,
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
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = normalizeEmail(args.email);
    const payment = { ...args, email: normalizedEmail };
    const purchase = await ctx.db
      .query("purchases")
      .withIndex("by_payment_id", (q) => q.eq("paymentId", args.paymentId))
      .unique();

    await (purchase
      ? ctx.db.patch(purchase._id, payment)
      : ctx.db.insert("purchases", payment));

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

export const getCurrentAccess = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const email = identity.email ? normalizeEmail(identity.email) : undefined;
    const bundleByAuthId = await ctx.db
      .query("purchases")
      .withIndex("by_auth_id_and_plan", (q) =>
        q.eq("authId", identity.tokenIdentifier).eq("plan", "bundle")
      )
      .first();
    const bundleByEmail = email
      ? await ctx.db
          .query("purchases")
          .withIndex("by_email_and_plan", (q) =>
            q.eq("email", email).eq("plan", "bundle")
          )
          .first()
      : null;

    if (bundleByAuthId || bundleByEmail) {
      return { plan: "bundle" as const };
    }

    const skillByAuthId = await ctx.db
      .query("purchases")
      .withIndex("by_auth_id_and_plan", (q) =>
        q.eq("authId", identity.tokenIdentifier).eq("plan", "skill")
      )
      .first();
    const skillByEmail = email
      ? await ctx.db
          .query("purchases")
          .withIndex("by_email_and_plan", (q) =>
            q.eq("email", email).eq("plan", "skill")
          )
          .first()
      : null;

    return skillByAuthId || skillByEmail ? { plan: "skill" as const } : null;
  },
});
