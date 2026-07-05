/// <reference types="@gridland/web/jsx" />

import type { ReactNode } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      b: { children?: ReactNode };
      dim: { children?: ReactNode };
      i: { children?: ReactNode };
      u: { children?: ReactNode };
    }
  }
}
