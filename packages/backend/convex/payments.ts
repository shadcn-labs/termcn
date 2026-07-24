import { v } from "convex/values";

import { action, env } from "./_generated/server";
import { checkout, customerPortal } from "./dodo";
import { isValidEmail, normalizeEmail } from "./lib/email";
import { accessPlan } from "./validators";

const productIdForPlan = (plan: "bundle" | "skill") =>
  plan === "bundle" ? env.DODO_BUNDLE_PRODUCT_ID : env.DODO_SKILL_PRODUCT_ID;

export const createCheckout = action({
  args: {
    email: v.string(),
    plan: accessPlan,
  },
  handler: async (ctx, { email, plan }) => {
    if (!isValidEmail(email)) {
      throw new Error("Enter a valid email address");
    }
    const normalizedEmail = normalizeEmail(email);
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
        },
        product_cart: [{ product_id: productIdForPlan(plan), quantity: 1 }],
        return_url: `${env.SITE_URL}/checkout/success?plan=${plan}`,
      },
    });
  },
});

export const getCustomerPortal = action({
  args: {},
  handler: async (ctx) => await customerPortal(ctx, { send_email: false }),
});
