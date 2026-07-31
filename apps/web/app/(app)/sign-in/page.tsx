import type { Metadata } from "next";

import { AuthForm } from "@/components/auth-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackURL?: string; email?: string }>;
}) {
  const { callbackURL, email } = await searchParams;
  const safeCallbackUrl =
    callbackURL?.startsWith("/") && !callbackURL.startsWith("//")
      ? callbackURL
      : ROUTES.ACCOUNT;

  return (
    <section className="section-soft grid flex-1 place-items-center px-4 py-16">
      <AuthForm callbackUrl={safeCallbackUrl} defaultEmail={email} />
    </section>
  );
}
