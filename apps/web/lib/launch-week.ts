import { ROUTES } from "@/constants/routes";

export interface LaunchWeekRelease {
  changelogHref: string;
  summary: string;
  title: string;
}

export interface LaunchWeekDay {
  date: string;
  day: string;
  releases: readonly LaunchWeekRelease[];
  status: "pending" | "shipped" | "skipped";
}

export interface LaunchWeekData {
  days: readonly LaunchWeekDay[];
  description: string;
  endDate: string;
  slug: string;
  startDate: string;
  status: "active" | "complete";
  title: string;
}

export const LAUNCH_WEEKS = [
  {
    days: [
      {
        date: "2026-08-03T00:00:00.000Z",
        day: "Monday",
        releases: [],
        status: "pending",
      },
      {
        date: "2026-08-04T00:00:00.000Z",
        day: "Tuesday",
        releases: [],
        status: "pending",
      },
      {
        date: "2026-08-05T00:00:00.000Z",
        day: "Wednesday",
        releases: [],
        status: "pending",
      },
      {
        date: "2026-08-06T00:00:00.000Z",
        day: "Thursday",
        releases: [],
        status: "pending",
      },
      {
        date: "2026-08-07T00:00:00.000Z",
        day: "Friday",
        releases: [],
        status: "pending",
      },
    ],
    description:
      "Five days of termcn releases, with a concise shipping log for each day.",
    endDate: "2026-08-07T00:00:00.000Z",
    slug: "2026-08-03",
    startDate: "2026-08-03T00:00:00.000Z",
    status: "active",
    title: "Launch Week 01",
  },
] as const satisfies readonly LaunchWeekData[];

const SHORT_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const LONG_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
  year: "numeric",
});

const LONG_DATE_WITHOUT_YEAR_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const LONG_MONTH_FORMAT = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  timeZone: "UTC",
});

const getOrdinalSuffix = (day: number) => {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  if (day % 10 === 1) {
    return "st";
  }
  if (day % 10 === 2) {
    return "nd";
  }
  if (day % 10 === 3) {
    return "rd";
  }
  return "th";
};

export const formatLaunchWeekDate = (date: string, includeYear = true) => {
  const value = new Date(date);
  if (includeYear) {
    return LONG_DATE_FORMAT.format(value);
  }
  const day = value.getUTCDate();
  return `${day}${getOrdinalSuffix(day)} ${LONG_MONTH_FORMAT.format(value)}`;
};

export const formatLaunchWeekRange = (
  week: LaunchWeekData,
  includeYear = true
) => {
  const start = SHORT_DATE_FORMAT.format(new Date(week.startDate));
  const end = (
    includeYear ? LONG_DATE_FORMAT : LONG_DATE_WITHOUT_YEAR_FORMAT
  ).format(new Date(week.endDate));
  return `${start} — ${end}`;
};

export const countLaunchWeekReleases = (week: LaunchWeekData) =>
  week.days.reduce((total, day) => total + day.releases.length, 0);

export const getLaunchWeeks = (): readonly LaunchWeekData[] =>
  [...LAUNCH_WEEKS].toSorted(
    (first, second) =>
      new Date(second.startDate).getTime() - new Date(first.startDate).getTime()
  );

export const getLaunchWeek = (slug: string) =>
  getLaunchWeeks().find((week) => week.slug === slug);

export const getLaunchWeekHref = (week: LaunchWeekData) =>
  `${ROUTES.LAUNCH_WEEK}/${week.slug}`;
