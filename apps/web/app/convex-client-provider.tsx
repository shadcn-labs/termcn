"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";

import { authClient } from "@/lib/auth-client";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
}

const convex = new ConvexReactClient(convexUrl);

export const ConvexClientProvider = ({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: null | string;
}) => (
  <ConvexBetterAuthProvider
    authClient={authClient}
    client={convex}
    initialToken={initialToken}
  >
    {children}
  </ConvexBetterAuthProvider>
);
