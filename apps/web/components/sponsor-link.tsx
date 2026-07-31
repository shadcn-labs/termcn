"use client";

import Link from "next/link";

import { ROUTES } from "@/constants/routes";
import { useFeedback } from "@/hooks/use-feedback";

export const SponsorLink = () => {
  const playClick = useFeedback({ sound: "click" });

  return (
    <Link
      href={ROUTES.SPONSOR}
      className="transition-colors hover:text-foreground"
      onClick={playClick}
    >
      Sponsors
    </Link>
  );
};
