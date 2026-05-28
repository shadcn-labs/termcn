import { ExternalLink, Heart, Plus, Star } from "lucide-react";
import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Image from "next/image";

import { DirectionalTransition } from "@/components/directional-transition";
import { Button } from "@/components/ui/button";
import { LINK, GITHUB } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  description:
    "Support termcn — beautiful terminal UI components for React. Sponsor tiers, stargazers, and how to contribute.",
  path: ROUTES.SPONSOR,
  title: "Sponsor",
});

interface Sponsor {
  name: string;
  href: string;
  logo?: string;
}

const tiers = [
  {
    colors: {
      bg: "linear-gradient(145deg, #d4a84b 0%, #f5d98a 30%, #c9952e 60%, #e8c55a 100%)",
      border: "#c9952e",
      slotBg: "rgba(212, 168, 75, 0.08)",
      slotBorder: "rgba(201, 149, 46, 0.25)",
      text: "#5c3d0e",
    },
    name: "Gold",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
  {
    colors: {
      bg: "linear-gradient(145deg, #a8a8a8 0%, #d4d4d4 30%, #8a8a8a 60%, #c0c0c0 100%)",
      border: "#8a8a8a",
      slotBg: "rgba(168, 168, 168, 0.06)",
      slotBorder: "rgba(138, 138, 138, 0.2)",
      text: "#2a2a2a",
    },
    name: "Silver",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
  {
    colors: {
      bg: "linear-gradient(145deg, #b5745a 0%, #d4956e 30%, #8c5a3e 60%, #c98a68 100%)",
      border: "#8c5a3e",
      slotBg: "rgba(181, 116, 90, 0.06)",
      slotBorder: "rgba(140, 90, 62, 0.2)",
      text: "#3d1e0e",
    },
    name: "Bronze",
    slots: 3,
    sponsors: [] as Sponsor[],
  },
];

interface Stargazer {
  login: string;
  avatar_url: string;
}

const getStargazers = unstable_cache(
  async (): Promise<Stargazer[]> => {
    try {
      const pages: Stargazer[] = [];
      let page = 1;

      while (page <= 5) {
        const response = await fetch(
          `https://api.github.com/repos/${GITHUB.user}/${GITHUB.repo}/stargazers?per_page=100&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
            },
          }
        );

        if (!response.ok) {
          break;
        }

        const data: Stargazer[] = await response.json();
        if (data.length === 0) {
          break;
        }

        pages.push(...data);
        if (data.length < 100) {
          break;
        }
        page += 1;
      }

      return pages.filter((s) => s.login !== GITHUB.user);
    } catch {
      return [];
    }
  },
  ["github-stargazers"],
  { revalidate: 86_400 }
);

const SponsorPage = async () => {
  const stargazers = await getStargazers();

  return (
    <DirectionalTransition>
      <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 md:px-0 lg:py-8 dark:text-neutral-300">
        <div className="flex flex-col gap-3">
          <h1 className="scroll-m-20 text-4xl font-semibold tracking-tight sm:text-3xl xl:text-4xl">
            Support the project
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            termcn is a collection of beautifully designed, accessible, and
            customizable terminal UI components for React. Every component is
            free and that&apos;s not changing.
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            I&apos;m not going to paywall features or gate components behind a
            sponsorship tier. But if termcn made your project better, or you
            just like that this exists in the open, sponsoring is a nice way to
            say so. It helps me justify spending real time on it instead of
            treating it like a side-of-desk thing.
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Any amount is genuinely appreciated. And if money&apos;s not your
            thing, starring the repo or sharing something you liked works too.
          </p>
        </div>
        <a href={LINK.SPONSOR} target="_blank" rel="noopener noreferrer">
          <Button size="lg">
            <Heart />
            Sponsor on GitHub
            <ExternalLink className="size-3.5 opacity-60" />
          </Button>
        </a>

        <section className="flex flex-col">
          {tiers.map((tier) => {
            const filled = tier.sponsors.length;
            const empty = tier.slots - filled;

            return (
              <div key={tier.name} className="flex flex-col gap-3 py-6">
                <div
                  className="relative flex items-center justify-center rounded-md px-8 py-2.5"
                  style={{
                    background: tier.colors.bg,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.12)",
                  }}
                >
                  {[
                    "left-2.5 top-1/2 -translate-y-1/2",
                    "right-2.5 top-1/2 -translate-y-1/2",
                  ].map((pos) => (
                    <span
                      key={pos}
                      className={`absolute size-2 rounded-full ${pos}`}
                      style={{
                        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), transparent 50%), ${tier.colors.bg}`,
                        border: "1px solid rgba(0,0,0,0.15)",
                        boxShadow:
                          "inset 0 1px 2px rgba(0,0,0,0.3), inset 0 -1px 1px rgba(255,255,255,0.2), 0 1px 1px rgba(255,255,255,0.15)",
                      }}
                    />
                  ))}
                  <h3
                    className="text-xs font-extrabold uppercase tracking-[0.2em]"
                    style={{ color: tier.colors.text }}
                  >
                    {tier.name}
                  </h3>
                </div>

                <div
                  className="grid gap-2 max-sm:grid-cols-[repeat(1,1fr)]! max-lg:grid-cols-[repeat(2,1fr)]!"
                  style={{
                    gridTemplateColumns: `repeat(${Math.min(tier.slots, 4)}, 1fr)`,
                  }}
                >
                  {tier.sponsors.map((sponsor) => (
                    <a
                      key={sponsor.name}
                      href={sponsor.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center rounded-md border p-6 transition-all hover:scale-[1.02]"
                      style={{
                        backgroundColor: tier.colors.slotBg,
                        borderColor: tier.colors.slotBorder,
                      }}
                    >
                      {sponsor.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sponsor.logo}
                          alt={sponsor.name}
                          className="h-8 w-auto opacity-60 transition-opacity group-hover:opacity-100"
                        />
                      ) : (
                        <span className="text-sm font-medium text-foreground">
                          {sponsor.name}
                        </span>
                      )}
                    </a>
                  ))}

                  {Array.from({ length: empty }).map((_, i) => (
                    <a
                      key={`empty-${tier.name}-${i}`}
                      href={LINK.SPONSOR}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center rounded-md border border-dashed p-8 transition-all hover:scale-[1.02]"
                      style={{ borderColor: tier.colors.slotBorder }}
                    >
                      <Plus
                        className="size-5"
                        style={{ color: tier.colors.border, opacity: 0.5 }}
                      />
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {stargazers.length > 0 && (
          <section className="flex flex-col rounded-lg border p-4">
            <div className="flex items-center gap-3 py-1">
              <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
                Stargazers
              </h3>
              <span className="text-xs tabular-nums text-muted-foreground">
                {stargazers.length}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-0 py-4">
              {stargazers.map((user) => (
                <a
                  key={user.login}
                  href={`https://github.com/${user.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={user.login}
                  className="group relative p-1.5 transition-colors hover:bg-accent/50"
                >
                  <Image
                    src={user.avatar_url}
                    alt={user.login}
                    width={36}
                    height={36}
                    className="rounded-full ring-1 ring-border transition-all group-hover:ring-foreground/30 group-hover:scale-110"
                    unoptimized
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col items-center gap-5 py-14">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-lg font-bold tracking-tight">
              Want to support the project?
            </h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Every bit helps — whether it&apos;s a sponsorship, a star, or
              sharing something you found useful.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href={LINK.SPONSOR} target="_blank" rel="noopener noreferrer">
              <Button size="default" className="gap-2">
                <Heart />
                Become a Sponsor
              </Button>
            </a>
            <a href={LINK.GITHUB} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="default" className="gap-2">
                <Star />
                Star on GitHub
              </Button>
            </a>
          </div>
        </section>
      </div>
    </DirectionalTransition>
  );
};

export default SponsorPage;
