import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { accessPlan, accessTokenScope, licenseTier } from "./validators";

export default defineSchema({
  accessTokens: defineTable({
    createdAt: v.number(),
    email: v.string(),
    expiresAt: v.number(),
    kind: v.union(v.literal("member"), v.literal("ci")),
    lastUsedAt: v.optional(v.number()),
    name: v.optional(v.string()),
    purchaseId: v.id("purchases"),
    scope: accessTokenScope,
    status: v.union(v.literal("active"), v.literal("revoked")),
    tokenHash: v.string(),
    tokenPrefix: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_token_hash", ["tokenHash"])
    .index("by_purchase_id", ["purchaseId"])
    .index("by_purchase_id_and_email", ["purchaseId", "email"]),
  billingCustomers: defineTable({
    authId: v.optional(v.string()),
    dodoCustomerId: v.string(),
    email: v.string(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"]),
  licenseKeys: defineTable({
    dodoLicenseKeyId: v.string(),
    expiresAt: v.optional(v.number()),
    keyHash: v.string(),
    paymentId: v.string(),
    productId: v.string(),
    status: v.string(),
  })
    .index("by_key_hash", ["keyHash"])
    .index("by_payment_id", ["paymentId"]),
  licenseMembers: defineTable({
    addedAt: v.number(),
    authId: v.optional(v.string()),
    email: v.string(),
    purchaseId: v.id("purchases"),
    revokedAt: v.optional(v.number()),
    role: v.union(v.literal("owner"), v.literal("member")),
    status: v.union(v.literal("active"), v.literal("revoked")),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"])
    .index("by_purchase_id", ["purchaseId"])
    .index("by_purchase_id_and_email", ["purchaseId", "email"]),
  purchases: defineTable({
    amount: v.number(),
    authId: v.optional(v.string()),
    currency: v.string(),
    dodoCustomerId: v.string(),
    email: v.string(),
    paymentId: v.string(),
    plan: accessPlan,
    seatLimit: v.optional(v.number()),
    status: v.string(),
    teamName: v.optional(v.string()),
    tier: v.optional(licenseTier),
  })
    .index("by_auth_id", ["authId"])
    .index("by_email", ["email"])
    .index("by_payment_id", ["paymentId"]),
});
