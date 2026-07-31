"use client";

import { api } from "@termcn/backend/convex/_generated/api";
import { useAction } from "convex/react";
import { ArrowUpRightIcon, LoaderCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export const PurchaseButton = ({
  plan,
  tier = "personal",
  children,
  className,
  variant = "default",
}: {
  plan: "bundle" | "skill";
  tier?: "personal" | "team";
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline";
}) => {
  const createCheckout = useAction(api.payments.createCheckout);
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const email = String(
      new FormData(event.currentTarget).get("email") ?? ""
    ).trim();
    try {
      const result = await createCheckout({ email, plan, tier });
      window.location.assign(result.checkout_url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to start checkout"
      );
      setIsLoading(false);
    }
  };

  return (
    <Dialog sounds>
      <DialogTrigger asChild>
        <Button
          className={cn("w-full", className)}
          size="lg"
          sound="click"
          variant={variant}
        >
          {children}
          <ArrowUpRightIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Continue to secure checkout</DialogTitle>
          <DialogDescription className="leading-6">
            {tier === "team"
              ? "Use the team owner's email. The owner occupies one of five named seats and can invite four more developers after checkout."
              : "Use the email you want linked to your termcn Pro access. Enter this same address when requesting a sign-in link."}
          </DialogDescription>
        </DialogHeader>
        <form className="mt-2 space-y-4" onSubmit={handlePurchase}>
          <label
            className="grid gap-2 text-sm font-medium"
            htmlFor={`${plan}-${tier}-checkout-email`}
          >
            Email address
            <Input
              autoComplete="email"
              id={`${plan}-${tier}-checkout-email`}
              name="email"
              placeholder="you@company.com"
              required
              type="email"
            />
          </label>
          <Button className="w-full" disabled={isLoading} size="lg">
            {isLoading && <LoaderCircleIcon className="animate-spin" />}
            Continue to checkout
          </Button>
          <p className="text-muted-foreground text-center text-xs leading-5">
            By continuing, you agree to the{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              href={ROUTES.TERMS}
              prefetch={false}
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              href={ROUTES.EULA}
              prefetch={false}
            >
              EULA
            </Link>
            , and acknowledge the{" "}
            <Link
              className="text-foreground underline underline-offset-4"
              href={ROUTES.PRIVACY}
              prefetch={false}
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
