import { v } from "convex/values";

import { action, env } from "./_generated/server";
import { checkout, customerPortal } from "./dodo";
import { isValidEmail, normalizeEmail } from "./lib/email";
import { seatLimitForTier } from "./lib/plans";
import { accessPlan, licenseTier } from "./validators";

const productIdForPlan = (
  plan: "bundle" | "skill",
  tier: "personal" | "team"
) => {
  const productId = {
    bundle: {
      personal: env.DODO_BUNDLE_PRODUCT_ID,
      team: env.DODO_TEAM_BUNDLE_PRODUCT_ID,
    },
    skill: {
      personal: env.DODO_SKILL_PRODUCT_ID,
      team: env.DODO_TEAM_SKILL_PRODUCT_ID,
    },
  }[plan][tier];

  if (!productId) {
    throw new Error(
      `Dodo Payments product is not configured for ${tier} ${plan}`
    );
  }
  return productId;
};

export const createCheckout = action({
  args: {
    email: v.string(),
    plan: accessPlan,
    tier: v.optional(licenseTier),
  },
  handler: async (ctx, { email, plan, tier: requestedTier }) => {
    if (!isValidEmail(email)) {
      throw new Error("Enter a valid email address");
    }
    const normalizedEmail = normalizeEmail(email);
    const tier = requestedTier ?? "personal";
    const seatLimit = seatLimitForTier(tier);
    const identity = await ctx.auth.getUserIdentity();

    return await checkout(ctx, {
      payload: {
        billing_currency: "USD",
        customer: {
          email: normalizedEmail,
          name: normalizedEmail.split("@")[0] ?? "termcn Pro customer",
        },
        customization: {
          show_order_details: true,
          theme: "system",
        },
        feature_flags: {
          allow_customer_editing_email: false,
          allow_customer_editing_name: true,
          allow_discount_code: true,
        },
        metadata: {
          ...(identity ? { authId: identity.tokenIdentifier } : {}),
          plan,
          product: plan,
          seatLimit: String(seatLimit),
          tier,
        },
        product_cart: [
          { product_id: productIdForPlan(plan, tier), quantity: 1 },
        ],
        return_url: `${env.SITE_URL}/checkout/success?plan=${plan}&tier=${tier}`,
      },
    });
  },
});

export const getCustomerPortal = action({
  args: {},
  handler: async (ctx) => await customerPortal(ctx, { send_email: false }),
});
