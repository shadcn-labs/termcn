import {
  BlocksIcon,
  BotIcon,
  CheckIcon,
  KeyRoundIcon,
  TerminalSquareIcon,
  UsersIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PurchaseButton } from "@/components/purchase-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTES } from "@/constants/routes";

export const metadata: Metadata = {
  description:
    "Production-ready terminal components, full application blocks, and the termcn.md agent skill.",
  title: "termcn Pro",
};

const features = [
  {
    description:
      "Private shadcn-compatible components for Ink and OpenTUI, fetched on demand from the protected Pro registry.",
    icon: TerminalSquareIcon,
    title: "Pro components",
  },
  {
    description:
      "Complete terminal experiences—onboarding, sessions, prompts, tools, diffs, and application flows.",
    icon: BlocksIcon,
    title: "Application blocks",
  },
  {
    description:
      "Installable guidance that gives coding agents the patterns and context needed to build polished terminal interfaces.",
    icon: BotIcon,
    title: "termcn.md skill",
  },
  {
    description:
      "Named seats, revocable member credentials, and longer-lived CI tokens for team automation.",
    icon: UsersIcon,
    title: "Team controls",
  },
];

const plans = [
  {
    features: [
      "Complete termcn.md skill",
      "Ink and OpenTUI guidance",
      "Updates included",
      "One named developer",
    ],
    label: "termcn.md Personal",
    plan: "skill" as const,
    price: "$50",
    tier: "personal" as const,
  },
  {
    features: [
      "Everything in termcn.md",
      "Five named developer seats",
      "Owner-managed invitations",
      "Separate short-lived credentials",
    ],
    label: "termcn.md Team",
    plan: "skill" as const,
    price: "$149",
    tier: "team" as const,
  },
  {
    featured: true,
    features: [
      "All Pro components and blocks",
      "Complete termcn.md skill",
      "Private registry access",
      "One named developer",
    ],
    label: "Termcn Pro Personal",
    plan: "bundle" as const,
    price: "$149",
    tier: "personal" as const,
  },
  {
    features: [
      "Everything in Pro",
      "Five named developer seats",
      "Owner-managed invitations",
      "CI registry credentials",
    ],
    label: "Termcn Pro Team",
    plan: "bundle" as const,
    price: "$499",
    tier: "team" as const,
  },
];

export default function ProPage() {
  return (
    <>
      <section className="section-soft border-b px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl text-center">
          <Badge variant="outline">termcn Pro</Badge>
          <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Build production terminal apps without rebuilding every interaction.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8 text-balance">
            Premium Ink and OpenTUI components, complete application blocks, and
            an agent skill—all delivered through revocable, licensed access.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#pricing" prefetch={false}>
                View pricing
                <KeyRoundIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.ACCOUNT} prefetch={false}>
                Manage access
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="text-muted-foreground size-5" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="leading-6">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-soft border-y px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
              How access works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Private source without shared secrets
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              [
                "01",
                "Purchase",
                "Dodo Payments completes checkout and a signed webhook activates the license.",
              ],
              [
                "02",
                "Sign in",
                "Use the checkout or invited email to receive a one-time sign-in link.",
              ],
              [
                "03",
                "Issue access",
                "Create short-lived registry or skill tokens and revoke them from Account.",
              ],
            ].map(([number, title, description]) => (
              <Card key={number}>
                <CardHeader>
                  <span className="text-muted-foreground font-mono text-xs">
                    {number}
                  </span>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription className="leading-6">
                    {description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24" id="pricing">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
              One-time license
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Choose the source your work needs
            </h2>
            <p className="text-muted-foreground mt-3 leading-7">
              Personal licenses cover one named developer. Team licenses cover
              five named developers, including the owner.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <Card
                className={
                  plan.featured ? "border-primary shadow-lg" : undefined
                }
                key={plan.label}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle>{plan.label}</CardTitle>
                    {plan.featured && <Badge>Most popular</Badge>}
                  </div>
                  <div className="pt-4">
                    <span className="text-4xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1 text-sm">
                      one time
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="mb-6 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckIcon className="mt-0.5 size-4 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <PurchaseButton
                    className="mt-auto"
                    plan={plan.plan}
                    tier={plan.tier}
                    variant={plan.featured ? "default" : "outline"}
                  >
                    Buy {plan.tier}
                  </PurchaseButton>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-muted-foreground mt-6 text-center text-xs">
            Need only the agent skill? See the{" "}
            <Link
              className="underline underline-offset-4"
              href={ROUTES.TERMCN_SKILL}
              prefetch={false}
            >
              termcn.md details
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
