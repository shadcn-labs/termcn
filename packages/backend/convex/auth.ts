import { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { magicLink } from "better-auth/plugins";

import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { env, query } from "./_generated/server";
import authConfig from "./auth.config";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const sendMagicLinkEmail = async (email: string, url: string) => {
  if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) {
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Magic-link email delivery is not configured",
    });
  }

  const response = await fetch("https://api.resend.com/emails", {
    body: JSON.stringify({
      from: env.AUTH_EMAIL_FROM,
      html: `<div style="font-family:ui-sans-serif,system-ui;line-height:1.6"><h1 style="font-size:24px">Sign in to termcn Pro</h1><p>Use the secure link below to access the source included with your purchase.</p><p><a href="${escapeHtml(url)}" style="background:#0a0a0a;border-radius:8px;color:#fff;display:inline-block;padding:12px 18px;text-decoration:none">Sign in to termcn Pro</a></p><p style="color:#666;font-size:14px">This link expires in 10 minutes and can only be used once.</p></div>`,
      subject: "Your termcn Pro sign-in link",
      text: `Sign in to termcn Pro:\n\n${url}\n\nThis link expires in 10 minutes and can only be used once.`,
      to: [email],
    }),
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    console.error("Magic-link email delivery failed", {
      status: response.status,
    });
    throw new APIError("INTERNAL_SERVER_ERROR", {
      message: "Unable to send the sign-in email. Try again shortly.",
    });
  }
};

export const authComponent = createClient<DataModel>(components.betterAuth);

const createAuth = (ctx: GenericCtx<DataModel>) =>
  betterAuth({
    baseURL: env.SITE_URL,
    database: authComponent.adapter(ctx),
    plugins: [
      magicLink({
        expiresIn: 600,
        rateLimit: { max: 3, window: 60 },
        sendMagicLink: async ({ email, url }) => {
          const hasPurchase = await ctx.runQuery(
            internal.billing.hasPurchaseForEmail,
            { email }
          );
          if (!hasPurchase) {
            throw new APIError("FORBIDDEN", {
              message:
                "Use your checkout email or the email invited to a team seat.",
            });
          }
          await sendMagicLinkEmail(email, url);
        },
        storeToken: "hashed",
      }),
      convex({
        authConfig,
        jwksRotateOnTokenGenerationError: true,
      }),
    ],
    trustedOrigins: [env.SITE_URL],
  });

export { createAuth };

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => await authComponent.safeGetAuthUser(ctx),
});
