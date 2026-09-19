import type { FC, PropsWithChildren } from "react";

/**
 * The real document shell lives in `app/[locale]/layout.tsx`; locale is part of
 * the route so this root layout only forwards children.
 */
const RootLayout: FC<PropsWithChildren> = ({ children }) => <>{children}</>;

export default RootLayout;
