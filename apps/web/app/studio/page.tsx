import type { Metadata } from "next";

import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

import { StudioBuilder } from "./studio-builder";

export const metadata: Metadata = createPageMetadata({
  description:
    "Build, theme, preview, and export production-ready terminal interfaces for Ink and OpenTUI.",
  path: ROUTES.STUDIO,
  title: "Studio",
});

export default function StudioPage() {
  return <StudioBuilder />;
}
