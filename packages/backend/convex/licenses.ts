"use node";

import { v } from "convex/values";
import { DodoPayments } from "dodopayments";

import { internal } from "./_generated/api";
import { action, env } from "./_generated/server";
import { hashLicenseKey } from "./lib/license";

export const validateRegistryLicense = action({
  args: { licenseKey: v.string() },
  handler: async (ctx, { licenseKey }) => {
    const trimmedKey = licenseKey.trim();
    if (trimmedKey.length < 8 || trimmedKey.length > 512) {
      return false;
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
