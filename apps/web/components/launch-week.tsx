"use client";

import {
  ArrowUpRightIcon,
  CheckIcon,
  CircleDashedIcon,
  LockIcon,
  MinusIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { MacWindow } from "@/components/mac-window";
import { PageHero } from "@/components/page-hero";
import {
  countLaunchWeekReleases,
  formatLaunchWeekDate,
  formatLaunchWeekRange,
} from "@/lib/launch-week";
import type { LaunchWeekData, LaunchWeekDay } from "@/lib/launch-week";
import { cn } from "@/lib/utils";

const DAY_STATUS = {
  pending: {
    icon: CircleDashedIcon,
    label: "Pending",
    variant: "secondary" as const,
  },
  shipped: {
    icon: CheckIcon,
    label: "Shipped",
    variant: "default" as const,
  },
  skipped: {
    icon: MinusIcon,
    label: "No release",
    variant: "outline" as const,
  },
};

const isSameUtcDay = (first: Date, second: Date) =>
  first.getUTCFullYear() === second.getUTCFullYear() &&
  first.getUTCMonth() === second.getUTCMonth() &&
  first.getUTCDate() === second.getUTCDate();

const getCountdown = (target: Date, now: Date | null) => {
  const remaining = now ? Math.max(0, target.getTime() - now.getTime()) : 0;
  const totalSeconds = Math.floor(remaining / 1000);

  return {
    days: Math.floor(totalSeconds / 86_400),
    hours: Math.floor((totalSeconds % 86_400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
};

const Countdown = ({ target, now }: { target: Date; now: Date | null }) => {
  const countdown = getCountdown(target, now);
  const units = [
    ["days", countdown.days],
    ["hrs", countdown.hours],
    ["min", countdown.minutes],
    ["sec", countdown.seconds],
  ] as const;

  return (
    <div
      aria-label={
        now
          ? `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds until the next launch`
          : "Loading the launch countdown"
      }
      className="mt-3 flex gap-6 font-mono tabular-nums sm:gap-8"
      role="timer"
    >
      {units.map(([label, value]) => (
        <div className="flex flex-col" key={label}>
          <span className="text-xl leading-none font-semibold tracking-tight sm:text-2xl">
            {now ? String(value).padStart(2, "0") : "--"}
          </span>
          <span className="text-muted-foreground mt-1 text-[10px] uppercase tracking-[0.16em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

const EmptyDay = ({
  day,
  includeYear,
  isFuture,
}: {
  day: LaunchWeekDay;
  includeYear: boolean;
  isFuture: boolean;
}) => (
  <div>
    {isFuture ? (
      <p className="text-muted-foreground text-sm">
        Opens on {formatLaunchWeekDate(day.date, includeYear)}.
      </p>
    ) : (
      <>
        <p className="text-sm font-medium">
          {day.status === "skipped" ? "Nothing shipped" : "No release yet"}
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {day.status === "skipped"
            ? "This day was intentionally left empty."
            : "Updates will appear here when something ships."}
        </p>
      </>
    )}
  </div>
);

const LaunchDay = ({
  day,
  includeYear,
  index,
  now,
}: {
  day: LaunchWeekDay;
  includeYear: boolean;
  index: number;
  now: Date | null;
}) => {
  const date = new Date(day.date);
  const isToday = now ? isSameUtcDay(date, now) : false;
  const isFuture = now ? date > now && !isToday : true;
  const status = DAY_STATUS[day.status];
  let StatusIcon = status.icon;
  let statusLabel = status.label;
  if (isToday) {
    StatusIcon = CircleDashedIcon;
    statusLabel = "Today";
  } else if (isFuture) {
    StatusIcon = LockIcon;
    statusLabel = "Locked";
  }

  return (
    <section className="border-t py-4">
      <div className="flex items-center justify-between gap-4">
        <h2
          className={cn(
            "text-sm font-semibold",
            !isToday && "text-muted-foreground"
          )}
        >
          {String(index + 1).padStart(2, "0")} · {day.day}
        </h2>
        <span className="text-muted-foreground flex min-w-[3.75rem] shrink-0 items-center gap-1.5 text-xs">
          <StatusIcon className="size-3.5" />
          {statusLabel}
        </span>
      </div>
      <div className="mt-3">
        {day.releases.length > 0 ? (
          <div className="divide-y">
            {day.releases.map((release) => (
              <article
                className="grid gap-2 py-4 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-start"
                key={release.changelogHref}
              >
                <div>
                  <h3 className="font-heading text-base font-semibold tracking-tight">
                    {release.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 max-w-xl text-sm leading-relaxed">
                    {release.summary}
                  </p>
                </div>
                <Link
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm font-medium transition-colors"
                  href={release.changelogHref}
                  transitionTypes={["nav-forward"]}
                >
                  Changelog
                  <ArrowUpRightIcon className="size-3.5" />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyDay day={day} includeYear={includeYear} isFuture={isFuture} />
        )}
      </div>
    </section>
  );
};

const getDayLabel = (day: LaunchWeekDay, now: Date | null) => {
  const date = new Date(day.date);
  if (now && isSameUtcDay(date, now)) {
    return "Today";
  }
  if (!now || date > now) {
    return "Locked";
  }
  return day.status === "shipped" ? "Shipped" : "Pending";
};

export const LaunchWeek = ({ week }: { week: LaunchWeekData }) => {
  const [now, setNow] = useState<Date | null>(null);
  const releaseCount = countLaunchWeekReleases(week);

  useEffect(() => {
    setNow(new Date());
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const nextLaunch = useMemo(
    () =>
      now
        ? (week.days.find(
            (day) => new Date(day.date) > now && day.status === "pending"
          ) ?? null)
        : week.days[0],
    [now, week.days]
  );

  return (
    <div className="container-wrapper">
      <div className="container max-w-2xl py-16 md:py-20 lg:py-24">
        <article>
          <PageHero
            description={`${formatLaunchWeekRange(week, week.status === "complete")} · Five days. Five releases.`}
            title={week.title}
          />

          <MacWindow className="mt-6 rounded-xl shadow-none" title="Terminal">
            <div className="bg-zinc-950 px-4 py-5 font-mono text-sm text-zinc-100 sm:px-5">
              <p>
                <span className="text-emerald-400">~</span> termcn releases
                --week {week.slug}
              </p>
              <p className="mt-2 text-zinc-400">
                {releaseCount === 0
                  ? "Waiting for the first release..."
                  : `${releaseCount} ${releaseCount === 1 ? "release" : "releases"} shipped`}
              </p>
            </div>
          </MacWindow>

          {nextLaunch ? (
            <section className="mt-6 border-t pt-5">
              <h2 className="text-sm font-semibold">
                Next launch: {nextLaunch.day}
              </h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Unlocks{" "}
                {formatLaunchWeekDate(
                  nextLaunch.date,
                  week.status === "complete"
                )}{" "}
                at 00:00 UTC.
              </p>
              <Countdown target={new Date(nextLaunch.date)} now={now} />
            </section>
          ) : null}

          <ol className="mt-5 grid overflow-hidden rounded-xl border sm:grid-cols-5">
            {week.days.map((day) => {
              const date = new Date(day.date);
              const isToday = now ? isSameUtcDay(date, now) : false;

              return (
                <li
                  className={cn(
                    "flex min-h-16 items-center justify-between gap-2 border-b p-3 last:border-b-0 sm:min-h-20 sm:flex-col sm:items-start sm:border-r sm:border-b-0 sm:last:border-r-0",
                    isToday ? "bg-foreground text-background" : "bg-background"
                  )}
                  key={day.date}
                >
                  <span className="text-xs font-semibold">
                    {day.day.slice(0, 3)}
                  </span>
                  <span
                    className={cn(
                      "text-xs",
                      isToday ? "text-background/70" : "text-muted-foreground"
                    )}
                  >
                    {getDayLabel(day, now)}
                  </span>
                  <time className="text-xs" dateTime={day.date}>
                    {new Intl.DateTimeFormat("en-GB", {
                      day: "numeric",
                      month: "short",
                      timeZone: "UTC",
                    }).format(date)}
                  </time>
                </li>
              );
            })}
          </ol>

          <section className="mt-7" aria-labelledby="shipping-log-title">
            <h2
              className="text-xl font-semibold tracking-tight"
              id="shipping-log-title"
            >
              Shipping log
            </h2>

            <div className="mt-3">
              {week.days.map((day, index) => (
                <LaunchDay
                  day={day}
                  includeYear={week.status === "complete"}
                  index={index}
                  key={day.date}
                  now={now}
                />
              ))}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
};
