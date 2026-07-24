import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import { accessPlan } from "./validators";

export default defineSchema({
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
  purchases: defineTable({
    amount: v.number(),
    authId: v.optional(v.string()),
    currency: v.string(),
    dodoCustomerId: v.string(),
    email: v.string(),
    paymentId: v.string(),
    plan: accessPlan,
    status: v.string(),
  })
    .index("by_auth_id", ["authId"])
    .index("by_auth_id_and_plan", ["authId", "plan"])
    .index("by_email", ["email"])
    .index("by_email_and_plan", ["email", "plan"])
    .index("by_payment_id", ["paymentId"]),
});
