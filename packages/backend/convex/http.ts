import { createDodoWebhookHandler } from "@dodopayments/convex";
import { httpRouter } from "convex/server";

import { internal } from "./_generated/api";
import { authComponent, createAuth } from "./auth";
import { hashLicenseKey } from "./lib/license";
import { seatLimitForTier } from "./lib/plans";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  handler: createDodoWebhookHandler({
    onLicenseKeyCreated: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.recordLicenseKey, {
        dodoLicenseKeyId: payload.data.id,
        expiresAt: payload.data.expires_at?.getTime(),
        keyHash: await hashLicenseKey(payload.data.key),
        paymentId: payload.data.payment_id,
        productId: payload.data.product_id,
        status: payload.data.status,
      });
    },
    onPaymentSucceeded: async (ctx, payload) => {
      const { authId, product, tier: requestedTier } = payload.data.metadata;
      const plan = product ?? payload.data.metadata.plan;
      const tier = requestedTier ?? "personal";

      if (
        (plan !== "skill" && plan !== "bundle") ||
        (tier !== "personal" && tier !== "team")
      ) {
        console.error("Dodo payment is missing valid access metadata", {
          paymentId: payload.data.payment_id,
        });
        return;
      }

      await ctx.runMutation(internal.billing.recordPaymentSucceeded, {
        amount: payload.data.total_amount,
        authId: typeof authId === "string" ? authId : undefined,
        currency: payload.data.currency,
        dodoCustomerId: payload.data.customer.customer_id,
        email: payload.data.customer.email,
        paymentId: payload.data.payment_id,
        plan,
        seatLimit: seatLimitForTier(tier),
        status: payload.data.status ?? "succeeded",
        tier,
      });
    },
    onRefundSucceeded: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.recordRefundSucceeded, {
        isPartial: payload.data.is_partial,
        paymentId: payload.data.payment_id,
      });
    },
  }),
  method: "POST",
  path: "/dodopayments-webhook",
});

export default http;
