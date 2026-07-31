"use client";

import { CheckCircle2Icon, LoaderCircleIcon, MailIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const AuthForm = ({
  callbackUrl = ROUTES.ACCOUNT,
  className,
  defaultEmail = "",
}: {
  callbackUrl?: string;
  className?: string;
  defaultEmail?: string;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const email = String(
      new FormData(event.currentTarget).get("email") ?? ""
    ).trim();
    const { error } = await authClient.signIn.magicLink({
      callbackURL: callbackUrl,
      email,
      errorCallbackURL: ROUTES.SIGN_IN,
    });

    if (error) {
      toast.error(
        error.message ??
          "Use your checkout email or the email invited to a team seat."
      );
      setIsSubmitting(false);
      return;
    }

    setSentTo(email);
    setIsSubmitting(false);
  };

  return (
    <div
      className={cn(
        "bg-background w-full max-w-md rounded-xl border p-6 shadow-xl sm:p-8",
        className
      )}
    >
      {sentTo ? (
        <div className="text-center">
          <span className="bg-muted mx-auto grid size-11 place-items-center rounded-full border">
            <CheckCircle2Icon className="size-5" />
          </span>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Check your inbox
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            We sent a one-time sign-in link to <strong>{sentTo}</strong>. The
            link expires in 10 minutes.
          </p>
          <Button
            className="mt-6"
            onClick={() => setSentTo(null)}
            type="button"
            variant="outline"
          >
            Use another email
          </Button>
        </div>
      ) : (
        <>
          <span className="bg-muted grid size-10 place-items-center rounded-full border">
            <MailIcon className="size-4.5" />
          </span>
          <p className="text-muted-foreground mt-5 font-mono text-xs uppercase tracking-[0.18em]">
            Customer access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Sign in to termcn Pro
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Enter your checkout email or the address invited to a team seat. We
            will email you a secure, one-time sign-in link.
          </p>
          <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium" htmlFor="email">
              Licensed email
              <Input
                autoComplete="email"
                defaultValue={defaultEmail}
                id="email"
                name="email"
                placeholder="you@company.com"
                required
                type="email"
              />
            </label>
            <Button
              className="w-full"
              disabled={isSubmitting}
              size="lg"
              sound="click"
            >
              {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
              Email me a sign-in link
            </Button>
          </form>
          <p className="text-muted-foreground mt-5 text-center text-xs leading-5">
            Access is available only to a completed purchase owner or an active
            named team member.
          </p>
        </>
      )}
    </div>
  );
};
