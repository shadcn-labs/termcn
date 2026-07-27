import { v } from "convex/values";

export const accessProduct = v.union(v.literal("skill"), v.literal("bundle"));

export const accessPlan = accessProduct;

export const accessTokenScope = v.union(
  v.literal("registry"),
  v.literal("skill")
);

export const licenseTier = v.union(v.literal("personal"), v.literal("team"));
