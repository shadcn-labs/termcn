"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/routes";
import { OPEN_CREATE_CODE_DIALOG_EVENT } from "@/lib/create-events";

export const DesignerActions = () => (
  <>
    <div className="flex items-center gap-2 group-has-data-[slot=designer]/layout:hidden">
      <Separator orientation="vertical" className="h-4" />
      <Button asChild size="sm" className="h-[31px] rounded-lg">
        <Link href={ROUTES.CREATE} transitionTypes={["nav-forward"]}>
          <PlusIcon />
          New
        </Link>
      </Button>
    </div>
    <div className="hidden items-center gap-2 group-has-data-[slot=designer]/layout:flex">
      <Separator orientation="vertical" className="h-4" />
      <Button
        size="sm"
        className="h-[31px] rounded-lg"
        onClick={() =>
          window.dispatchEvent(new Event(OPEN_CREATE_CODE_DIALOG_EVENT))
        }
      >
        Get Code
      </Button>
    </div>
  </>
);
