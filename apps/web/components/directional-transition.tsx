"use client";

import { ViewTransition } from "react";

export const DirectionalTransition = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ViewTransition
    enter={{
      default: "none",
      "nav-back": "slide-from-left",
      "nav-forward": "slide-from-right",
    }}
    exit={{
      default: "none",
      "nav-back": "slide-to-right",
      "nav-forward": "slide-to-left",
    }}
    default="none"
  >
    {children}
  </ViewTransition>
);
