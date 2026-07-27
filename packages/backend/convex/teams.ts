import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import { env, internalAction, mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { isValidEmail, normalizeEmail } from "./lib/email";

const inactivePurchaseStatuses = new Set([
  "cancelled",
  "disputed",
  "expired",
  "failed",
  "refunded",
  "revoked",
]);

const isActiveTeamPurchase = (
  purchase: Doc<"purchases"> | null
): purchase is Doc<"purchases"> =>
  purchase !== null &&
  (purchase.tier ?? "personal") === "team" &&
  !inactivePurchaseStatuses.has(purchase.status.toLowerCase());

const requireIdentity = async (ctx: Pick<MutationCtx, "auth">) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity?.email) {
    throw new Error("Not authenticated");
  }
  return {
    authId: identity.tokenIdentifier,
    email: normalizeEmail(identity.email),
  };
};

export const getMyTeams = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) {
      return [];
    }
    const email = normalizeEmail(identity.email);
    const ownedPurchaseIds = new Set<Id<"purchases">>();

    const purchasesByEmail = await ctx.db
      .query("purchases")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    for (const purchase of purchasesByEmail) {
      if (isActiveTeamPurchase(purchase)) {
        ownedPurchaseIds.add(purchase._id);
      }
    }

    const purchasesByAuthId = await ctx.db
      .query("purchases")
      .withIndex("by_auth_id", (q) => q.eq("authId", identity.tokenIdentifier))
      .collect();
    for (const purchase of purchasesByAuthId) {
      if (isActiveTeamPurchase(purchase)) {
        ownedPurchaseIds.add(purchase._id);
      }
    }

    const ownerMemberships = await ctx.db
      .query("licenseMembers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .collect();
    const ownerPurchases = await Promise.all(
      ownerMemberships
        .filter(
          (membership) =>
            membership.role === "owner" && membership.status === "active"
        )
        .map(async (membership) => ({
          membership,
          purchase: await ctx.db.get(membership.purchaseId),
        }))
    );
    for (const { membership, purchase } of ownerPurchases) {
      if (isActiveTeamPurchase(purchase)) {
        ownedPurchaseIds.add(membership.purchaseId);
      }
    }

    const teams = await Promise.all(
      [...ownedPurchaseIds].map(async (purchaseId) => {
        const purchase = await ctx.db.get(purchaseId);
        if (!isActiveTeamPurchase(purchase)) {
          return null;
        }
        const members = await ctx.db
          .query("licenseMembers")
          .withIndex("by_purchase_id", (q) => q.eq("purchaseId", purchaseId))
          .collect();
        const activeMembers = members
          .filter((member) => member.status === "active")
          .map((member) => ({
            addedAt: member.addedAt,
            email: member.email,
            role: member.role,
          }));
        return {
          members: [
            ...activeMembers.filter((member) => member.role === "owner"),
            ...activeMembers.filter((member) => member.role === "member"),
          ],
          plan: purchase.plan,
          purchaseId,
          seatLimit: purchase.seatLimit ?? 5,
          teamName: purchase.teamName ?? "Termcn Pro Team",
        };
      })
    );
    return teams.filter((team) => team !== null);
  },
});

const getOwnedTeam = async (
  ctx: Pick<MutationCtx, "db">,
  purchaseId: Id<"purchases">,
  identity: { authId: string; email: string }
) => {
  const purchase = await ctx.db.get(purchaseId);
  if (!isActiveTeamPurchase(purchase)) {
    throw new Error("Team license not found or inactive");
  }
  const ownerMembership = await ctx.db
    .query("licenseMembers")
    .withIndex("by_purchase_id_and_email", (q) =>
      q.eq("purchaseId", purchaseId).eq("email", identity.email)
    )
    .unique();
  const ownsPurchase =
    purchase.email === identity.email ||
    purchase.authId === identity.authId ||
    (ownerMembership?.role === "owner" && ownerMembership.status === "active");
  if (!ownsPurchase) {
    throw new Error("Unauthorized");
  }
  return purchase;
};

export const inviteMember = mutation({
  args: { email: v.string(), purchaseId: v.id("purchases") },
  handler: async (ctx, { email, purchaseId }) => {
    const identity = await requireIdentity(ctx);
    const purchase = await getOwnedTeam(ctx, purchaseId, identity);
    if (!isValidEmail(email)) {
      throw new Error("Enter a valid email address");
    }
    const memberEmail = normalizeEmail(email);
    if (memberEmail === identity.email) {
      throw new Error("The team owner already occupies a seat");
    }

    const members = await ctx.db
      .query("licenseMembers")
      .withIndex("by_purchase_id", (q) => q.eq("purchaseId", purchaseId))
      .collect();
    const existingMember = members.find(
      (member) => member.email === memberEmail
    );
    if (existingMember?.status === "active") {
      throw new Error("That email already has a team seat");
    }
    const activeSeats = members.filter(
      (member) => member.status === "active"
    ).length;
    const seatLimit = purchase.seatLimit ?? 5;
    if (activeSeats >= seatLimit) {
      throw new Error(`This team license is limited to ${seatLimit} seats`);
    }

    const memberData = {
      addedAt: Date.now(),
      email: memberEmail,
      purchaseId,
      role: "member" as const,
      status: "active" as const,
    };
    await (existingMember
      ? ctx.db.patch(existingMember._id, {
          ...memberData,
          revokedAt: undefined,
        })
      : ctx.db.insert("licenseMembers", memberData));

    await ctx.scheduler.runAfter(0, internal.teams.sendInvitationEmail, {
      email: memberEmail,
      plan: purchase.plan,
      teamName: purchase.teamName ?? "Termcn Pro Team",
    });
    return { email: memberEmail, seatLimit, seatsUsed: activeSeats + 1 };
  },
});

export const removeMember = mutation({
  args: { email: v.string(), purchaseId: v.id("purchases") },
  handler: async (ctx, { email, purchaseId }) => {
    const identity = await requireIdentity(ctx);
    await getOwnedTeam(ctx, purchaseId, identity);
    const memberEmail = normalizeEmail(email);
    const member = await ctx.db
      .query("licenseMembers")
      .withIndex("by_purchase_id_and_email", (q) =>
        q.eq("purchaseId", purchaseId).eq("email", memberEmail)
      )
      .unique();
    if (!member || member.status !== "active") {
      throw new Error("Active team member not found");
    }
    if (member.role === "owner") {
      throw new Error("The team owner cannot be removed");
    }

    await ctx.db.patch(member._id, {
      revokedAt: Date.now(),
      status: "revoked",
    });
    const tokens = await ctx.db
      .query("accessTokens")
      .withIndex("by_purchase_id_and_email", (q) =>
        q.eq("purchaseId", purchaseId).eq("email", memberEmail)
      )
      .collect();
    await Promise.all(
      tokens
        .filter((token) => token.status === "active")
        .map((token) => ctx.db.patch(token._id, { status: "revoked" }))
    );
    return { removed: true };
  },
});

export const renameTeam = mutation({
  args: { name: v.string(), purchaseId: v.id("purchases") },
  handler: async (ctx, { name, purchaseId }) => {
    const identity = await requireIdentity(ctx);
    await getOwnedTeam(ctx, purchaseId, identity);
    const teamName = name.trim();
    if (teamName.length < 2 || teamName.length > 80) {
      throw new Error("Team name must be between 2 and 80 characters");
    }
    await ctx.db.patch(purchaseId, { teamName });
    return { teamName };
  },
});

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export const sendInvitationEmail = internalAction({
  args: {
    email: v.string(),
    plan: v.union(v.literal("skill"), v.literal("bundle")),
    teamName: v.string(),
  },
  handler: async (_ctx, { email, plan, teamName }) => {
    if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) {
      console.error("Team invitation email delivery is not configured");
      return;
    }
    const signInUrl = new URL("/sign-in", env.SITE_URL);
    signInUrl.searchParams.set("callbackURL", "/account");
    signInUrl.searchParams.set("email", email);
    const productName =
      plan === "bundle" ? "Termcn Pro Team" : "termcn.md Team";
    const safeTeamName = escapeHtml(teamName);
    const safeUrl = escapeHtml(signInUrl.toString());
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from: env.AUTH_EMAIL_FROM,
        html: `<div style="font-family:ui-sans-serif,system-ui;line-height:1.6"><h1 style="font-size:24px">Join ${safeTeamName}</h1><p>You have been assigned a named seat for ${productName}.</p><p><a href="${safeUrl}" style="background:#0a0a0a;border-radius:8px;color:#fff;display:inline-block;padding:12px 18px;text-decoration:none">Accept team access</a></p><p style="color:#666;font-size:14px">Sign in with ${escapeHtml(email)}. Team seats and access credentials may not be shared.</p></div>`,
        subject: `You have been invited to ${teamName}`,
        text: `You have been assigned a named seat for ${productName} in ${teamName}.\n\nSign in with ${email}: ${signInUrl.toString()}\n\nTeam seats and access credentials may not be shared.`,
        to: [email],
      }),
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    if (!response.ok) {
      console.error("Team invitation email delivery failed", {
        status: response.status,
      });
    }
  },
});
