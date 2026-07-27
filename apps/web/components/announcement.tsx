import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";

export const Announcement = () => (
  <Badge asChild variant="secondary" className="bg-transparent">
    <Link href={ROUTES.DOCS} rel="noreferrer">
      <span className="flex size-2 rounded-full bg-blue-500" title="New" />
      termcn — shadcn-compatible registry <ArrowRightIcon />
    </Link>
  </Badge>
);
