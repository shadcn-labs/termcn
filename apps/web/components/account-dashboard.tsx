"use client";

import { api } from "@termcn/backend/convex/_generated/api";
import type { Id } from "@termcn/backend/convex/_generated/dataModel";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  KeyRoundIcon,
  LoaderCircleIcon,
  LogOutIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/auth-form";
import { CopyButton } from "@/components/copy-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROUTES } from "@/constants/routes";
import { authClient } from "@/lib/auth-client";

interface IssuedToken {
  expiresAt: number;
  scope: "registry" | "skill";
  token: string;
}

const formatDate = (value: number) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const productLabel = (plan: "bundle" | "skill") =>
  plan === "bundle" ? "Termcn Pro Bundle" : "termcn.md Skill";

const signOut = async () => {
  await authClient.signOut();
  window.location.assign(ROUTES.HOME);
};

const registryConfiguration = (origin: string) => `{
  "registries": {
    "@termcn-pro": {
      "url": "${origin}/pro/r/{name}.json",
      "headers": {
        "Authorization": "Bearer \${TERMCN_REGISTRY_TOKEN}"
      }
    }
  }
}`;

const tokenCommand = (issued: IssuedToken) =>
  issued.scope === "registry"
    ? `export TERMCN_REGISTRY_TOKEN="${issued.token}"`
    : `export TERMCN_SKILL_TOKEN="${issued.token}"
mkdir -p .agents/skills
curl -fsSL "${window.location.origin}${ROUTES.SKILL_BUNDLE}" \\
  -H "Authorization: Bearer $TERMCN_SKILL_TOKEN" | tar -x -C .agents/skills`;

const IssuedTokenPanel = ({ issued }: { issued: IssuedToken }) => {
  const command = tokenCommand(issued);
  const isRegistry = issued.scope === "registry";
  const config = isRegistry
    ? registryConfiguration(window.location.origin)
    : undefined;

  return (
    <div className="border-primary/30 bg-primary/5 mt-6 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Copy this token now</p>
          <p className="text-muted-foreground mt-1 text-xs leading-5">
            It is shown once and expires {formatDate(issued.expiresAt)}.
          </p>
        </div>
        <CopyButton showTooltip={false} value={issued.token} variant="outline">
          Copy token
        </CopyButton>
      </div>
      <code className="bg-background mt-3 block overflow-x-auto rounded-md border p-3 text-xs">
        {issued.token}
      </code>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {isRegistry
            ? "Export the token before running shadcn."
            : "Run this from the project where you want to install the skill."}
        </p>
        <CopyButton showTooltip={false} value={command} variant="outline">
          Copy command
        </CopyButton>
      </div>
      {config && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">components.json registry</p>
            <CopyButton showTooltip={false} value={config} variant="outline">
              Copy config
            </CopyButton>
          </div>
          <pre className="bg-background text-muted-foreground mt-3 overflow-x-auto rounded-md border p-3 text-xs leading-5">
            {config}
          </pre>
          <p className="text-muted-foreground mt-3 text-xs">
            Then install an item with{" "}
            <code>pnpm dlx shadcn@latest add @termcn-pro/ink/…</code>.
          </p>
        </div>
      )}
    </div>
  );
};

export const AccountDashboard = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const access = useQuery(
    api.billing.getCurrentAccess,
    isAuthenticated ? {} : "skip"
  );
  const teams = useQuery(api.teams.getMyTeams, isAuthenticated ? {} : "skip");
  const tokens = useQuery(
    api["access-tokens"].listMine,
    isAuthenticated ? {} : "skip"
  );
  const issueAccessToken = useAction(api.licenses.issueAccessToken);
  const issueCiToken = useAction(api.licenses.issueCiToken);
  const inviteMember = useMutation(api.teams.inviteMember);
  const removeMember = useMutation(api.teams.removeMember);
  const revokeToken = useMutation(api["access-tokens"].revokeMine);
  const [issued, setIssued] = useState<IssuedToken | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mx-auto grid min-h-80 max-w-5xl place-items-center">
        <LoaderCircleIcon className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm callbackUrl={ROUTES.ACCOUNT} className="mx-auto" />;
  }

  const issueMemberToken = async (
    purchaseId: Id<"purchases">,
    scope: "registry" | "skill"
  ) => {
    const actionId = `${purchaseId}:${scope}`;
    setPendingAction(actionId);
    try {
      const result = await issueAccessToken({ purchaseId, scope });
      setIssued(result);
      toast.success(
        `${scope === "skill" ? "Skill" : "Registry"} token created`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create token"
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleInvite = async (
    event: React.FormEvent<HTMLFormElement>,
    purchaseId: Id<"purchases">
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    setPendingAction(`${purchaseId}:invite`);
    try {
      await inviteMember({ email, purchaseId });
      form.reset();
      toast.success(`Team access granted to ${email}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to invite member"
      );
    } finally {
      setPendingAction(null);
    }
  };

  const handleCiToken = async (
    event: React.FormEvent<HTMLFormElement>,
    purchaseId: Id<"purchases">
  ) => {
    event.preventDefault();
    const form = event.currentTarget;
    const name = String(new FormData(form).get("name") ?? "").trim();
    setPendingAction(`${purchaseId}:ci`);
    try {
      const result = await issueCiToken({ name, purchaseId });
      setIssued(result);
      form.reset();
      toast.success("CI token created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to create CI token"
      );
    } finally {
      setPendingAction(null);
    }
  };

  const renderAccess = () => {
    if (access === undefined) {
      return (
        <Card>
          <CardContent className="grid min-h-32 place-items-center">
            <LoaderCircleIcon className="text-muted-foreground size-5 animate-spin" />
          </CardContent>
        </Card>
      );
    }
    if (access === null) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>No active license</CardTitle>
            <CardDescription>
              This email does not currently have a paid license or active team
              seat.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return (
      <section className="grid gap-4 lg:grid-cols-2">
        {access.entitlements.map((entitlement) => (
          <Card key={entitlement.purchaseId}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{productLabel(entitlement.plan)}</CardTitle>
                <Badge variant="outline">
                  {entitlement.tier === "team" ? "Team" : "Personal"}
                </Badge>
                <Badge variant="secondary">{entitlement.role}</Badge>
              </div>
              <CardDescription>
                {entitlement.tier === "team"
                  ? `${entitlement.seatLimit} named developer seats. The owner counts as one seat.`
                  : "Licensed to one named developer."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                disabled={pendingAction !== null}
                onClick={() =>
                  issueMemberToken(entitlement.purchaseId, "skill")
                }
                type="button"
                variant="outline"
              >
                {pendingAction === `${entitlement.purchaseId}:skill` ? (
                  <LoaderCircleIcon className="animate-spin" />
                ) : (
                  <KeyRoundIcon />
                )}
                Get skill token
              </Button>
              {entitlement.plan === "bundle" && (
                <Button
                  disabled={pendingAction !== null}
                  onClick={() =>
                    issueMemberToken(entitlement.purchaseId, "registry")
                  }
                  type="button"
                >
                  {pendingAction === `${entitlement.purchaseId}:registry` ? (
                    <LoaderCircleIcon className="animate-spin" />
                  ) : (
                    <ShieldCheckIcon />
                  )}
                  Get registry token
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.18em]">
            Licensed access
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Manage named seats and create revocable credentials for the skill,
            registry, and CI.
          </p>
        </div>
        <Button onClick={signOut} type="button" variant="outline">
          <LogOutIcon />
          Sign out
        </Button>
      </header>

      {renderAccess()}

      {issued && <IssuedTokenPanel issued={issued} />}

      {teams && teams.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Teams</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Each person signs in with their own invited email and receives
              separate credentials.
            </p>
          </div>
          {teams.map((team) => (
            <Card key={team.purchaseId}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <UsersIcon className="size-5" />
                  <CardTitle>{team.teamName}</CardTitle>
                  <Badge variant="outline">{productLabel(team.plan)}</Badge>
                </div>
                <CardDescription>
                  {team.members.length} of {team.seatLimit} named seats in use.
                  The owner occupies one seat.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <form
                  className="flex flex-col gap-2 sm:flex-row"
                  onSubmit={(event) => handleInvite(event, team.purchaseId)}
                >
                  <Input
                    aria-label="Member email"
                    name="email"
                    placeholder="developer@company.com"
                    required
                    type="email"
                  />
                  <Button
                    disabled={
                      pendingAction !== null ||
                      team.members.length >= team.seatLimit
                    }
                  >
                    {pendingAction === `${team.purchaseId}:invite` ? (
                      <LoaderCircleIcon className="animate-spin" />
                    ) : (
                      <UserPlusIcon />
                    )}
                    Add member
                  </Button>
                </form>
                <div className="divide-y rounded-lg border">
                  {team.members.map((member) => (
                    <div
                      className="flex items-center justify-between gap-3 px-3 py-2.5"
                      key={member.email}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {member.email}
                        </p>
                        <p className="text-muted-foreground text-xs capitalize">
                          {member.role}
                        </p>
                      </div>
                      {member.role !== "owner" && (
                        <Button
                          aria-label={`Remove ${member.email}`}
                          disabled={pendingAction !== null}
                          onClick={async () => {
                            setPendingAction(
                              `${team.purchaseId}:remove:${member.email}`
                            );
                            try {
                              await removeMember({
                                email: member.email,
                                purchaseId: team.purchaseId,
                              });
                              toast.success(`${member.email} removed`);
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Unable to remove member"
                              );
                            } finally {
                              setPendingAction(null);
                            }
                          }}
                          size="icon"
                          type="button"
                          variant="ghost"
                        >
                          {pendingAction ===
                          `${team.purchaseId}:remove:${member.email}` ? (
                            <LoaderCircleIcon className="animate-spin" />
                          ) : (
                            <Trash2Icon />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {team.plan === "bundle" && (
                  <form
                    className="flex flex-col gap-2 border-t pt-5 sm:flex-row"
                    onSubmit={(event) => handleCiToken(event, team.purchaseId)}
                  >
                    <Input
                      aria-label="CI token name"
                      name="name"
                      placeholder="Production CI"
                      required
                    />
                    <Button disabled={pendingAction !== null} variant="outline">
                      {pendingAction === `${team.purchaseId}:ci` ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : (
                        <KeyRoundIcon />
                      )}
                      Create CI token
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {tokens && tokens.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Access credentials
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Secrets are never stored in plaintext. Revoke credentials you no
              longer use.
            </p>
          </div>
          <div className="bg-background divide-y rounded-xl border">
            {tokens.map((token) => {
              const status =
                token.status === "active" && token.expiresAt <= Date.now()
                  ? "expired"
                  : token.status;
              return (
                <div
                  className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"
                  key={token.id}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-sm">{token.tokenPrefix}…</code>
                      <Badge variant="outline">{token.scope}</Badge>
                      <Badge variant="secondary">{token.kind}</Badge>
                      <Badge
                        variant={status === "active" ? "default" : "outline"}
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {token.name ? `${token.name} · ` : ""}Expires{" "}
                      {formatDate(token.expiresAt)}
                    </p>
                  </div>
                  {status === "active" && (
                    <Button
                      disabled={pendingAction !== null}
                      onClick={async () => {
                        setPendingAction(`revoke:${token.id}`);
                        try {
                          await revokeToken({ tokenId: token.id });
                          toast.success("Token revoked");
                        } catch (error) {
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to revoke token"
                          );
                        } finally {
                          setPendingAction(null);
                        }
                      }}
                      type="button"
                      variant="outline"
                    >
                      {pendingAction === `revoke:${token.id}` ? (
                        <LoaderCircleIcon className="animate-spin" />
                      ) : (
                        <Trash2Icon />
                      )}
                      Revoke
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
