import { DodoPayments } from "@dodopayments/convex";
import type { DodoPaymentsClientConfig } from "@dodopayments/convex";

import { components, internal } from "./_generated/api";
import { env } from "./_generated/server";

const config: DodoPaymentsClientConfig = {
  apiKey: env.DODO_PAYMENTS_API_KEY,
  environment: env.DODO_PAYMENTS_ENVIRONMENT,
  identify: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const customerByEmail = identity.email
      ? await ctx.runQuery(internal.billing.getCustomerByEmail, {
          email: identity.email,
        })
      : null;
    const customer =
      customerByEmail ??
      (await ctx.runQuery(internal.billing.getCustomerByAuthId, {
        authId: identity.tokenIdentifier,
      }));

    return customer ? { dodoCustomerId: customer.dodoCustomerId } : null;
  },
};

export const dodo = new DodoPayments(components.dodopayments, config);
export const { checkout, customerPortal } = dodo.api();
