import {
  BotIcon,
  CheckIcon,
  FileCode2Icon,
  RefreshCcwIcon,
  TerminalIcon,
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
    "An installable agent skill for building polished Ink and OpenTUI applications.",
  title: "termcn.md",
};

const capabilities = [
  {
    description:
      "Reliable layout, input, focus, rendering, accessibility, and testing patterns for both supported renderers.",
    icon: TerminalIcon,
    title: "Ink and OpenTUI",
  },
  {
    description:
      "Practical component recipes, architectural guidance, and debugging checklists your coding agent can follow.",
    icon: FileCode2Icon,
    title: "Implementation context",
  },
  {
    description:
      "Install the skill in a project and let compatible agents discover it from the standard .agents/skills directory.",
    icon: BotIcon,
    title: "Agent-native delivery",
  },
  {
    description:
      "Reissue the short-lived download credential from Account whenever you need the latest licensed version.",
    icon: RefreshCcwIcon,
    title: "Updates included",
  },
];

export default function TermcnSkillPage() {
  return (
    <>
      <section className="section-soft border-b px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline">termcn.md</Badge>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Give your coding agent terminal UI expertise.
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg leading-8 text-balance">
            A focused, installable skill that teaches compatible agents how to
            design, implement, and debug production-quality Ink and OpenTUI
            applications.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#skill-pricing" prefetch={false}>
                Get termcn.md
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={ROUTES.PRO} prefetch={false}>
                Compare with Pro
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-2">
          {capabilities.map((capability) => (
            <Card key={capability.title}>
              <CardHeader>
                <capability.icon className="text-muted-foreground size-5" />
                <CardTitle>{capability.title}</CardTitle>
                <CardDescription className="leading-6">
                  {capability.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="section-soft border-y px-4 py-16 sm:py-24"
        id="skill-pricing"
      >
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
              One-time license
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Install it wherever you build
            </h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {[
              {
                features: [
                  "One named developer",
                  "Complete skill bundle",
                  "Ink and OpenTUI guidance",
                  "Updates included",
                ],
                label: "Personal",
                price: "$50",
                tier: "personal" as const,
              },
              {
                features: [
                  "Five named developers",
                  "Complete skill bundle",
                  "Owner-managed seats",
                  "Separate member credentials",
                ],
                label: "Team",
                price: "$149",
                tier: "team" as const,
              },
            ].map((plan) => (
              <Card key={plan.label}>
                <CardHeader>
                  <CardTitle>{plan.label}</CardTitle>
                  <div className="pt-4">
                    <span className="text-4xl font-semibold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground ml-1 text-sm">
                      one time
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mb-6 space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li className="flex gap-2" key={feature}>
                        <CheckIcon className="mt-0.5 size-4 shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <PurchaseButton plan="skill" tier={plan.tier}>
                    Buy {plan.label}
                  </PurchaseButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
