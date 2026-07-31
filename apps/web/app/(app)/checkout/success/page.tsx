import { CheckCircle2Icon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AuthForm } from "@/components/auth-form";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = { title: "Purchase complete" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; tier?: string }>;
}) {
  const { email = "", tier } = await searchParams;
  const isTeam = tier === "team";

  return (
    <section className="section-soft grid flex-1 place-items-center px-4 py-20">
      <div className="w-full max-w-xl space-y-5">
        <div className="bg-background rounded-xl border p-8 text-center shadow-xl sm:p-10">
          <span className="bg-muted mx-auto grid size-12 place-items-center rounded-full border">
            <CheckCircle2Icon className="size-5" />
          </span>
          <p className="text-muted-foreground mt-6 font-mono text-xs uppercase tracking-[0.18em]">
            Payment received
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Welcome to termcn Pro.
          </h1>
          <p className="text-muted-foreground mt-3 leading-7">
            Sign in below with the same email used at checkout. Access becomes
            available after the signed Dodo Payments webhook is confirmed.
          </p>
          <p className="bg-muted/30 text-muted-foreground mt-7 rounded-lg border p-4 text-left text-sm leading-6">
            {isTeam
              ? "Your owner account includes one of five named seats. Open Account after signing in to invite four developers and issue separate access credentials."
              : "Open Account after signing in to create a short-lived skill token and, for the Pro bundle, a registry token."}
          </p>
        </div>
        <AuthForm
          callbackUrl={ROUTES.ACCOUNT}
          className="max-w-none shadow-xl"
          defaultEmail={email}
        />
        <p className="text-muted-foreground text-center text-xs">
          Need setup help? Read the{" "}
          <Link
            className="underline underline-offset-4"
            href={ROUTES.DOCS_INSTALLATION}
            prefetch={false}
          >
            registry installation guide
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
