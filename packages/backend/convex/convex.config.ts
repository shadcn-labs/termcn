import betterAuth from "@convex-dev/better-auth/convex.config";
import dodopayments from "@dodopayments/convex/convex.config";
import { defineApp } from "convex/server";
import { v } from "convex/values";

const app = defineApp({
  env: {
    AUTH_EMAIL_FROM: v.optional(v.string()),
    DODO_BUNDLE_PRODUCT_ID: v.string(),
    DODO_PAYMENTS_API_KEY: v.string(),
    DODO_PAYMENTS_ENVIRONMENT: v.union(
      v.literal("live_mode"),
      v.literal("test_mode")
    ),
    DODO_SKILL_PRODUCT_ID: v.string(),
    DODO_TEAM_BUNDLE_PRODUCT_ID: v.optional(v.string()),
    DODO_TEAM_SKILL_PRODUCT_ID: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
    SITE_URL: v.string(),
  },
});

app.use(betterAuth);
app.use(dodopayments);

export default app;
