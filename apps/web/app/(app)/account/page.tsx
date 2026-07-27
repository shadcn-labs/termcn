import type { Metadata } from "next";

import { AccountDashboard } from "@/components/account-dashboard";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <section className="section-soft flex-1 px-4 py-12 sm:py-16">
      <AccountDashboard />
    </section>
  );
}
