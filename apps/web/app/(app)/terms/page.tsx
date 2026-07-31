import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  description: "Terms of service for Termcn Pro.",
  path: ROUTES.TERMS,
  title: "Terms of Service",
});

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="July 21, 2026">
      <section>
        <h2 className="text-base font-semibold">1. Acceptance of Terms</h2>
        <p className="mt-4">
          These Terms govern your access to the Termcn Pro website, account,
          checkout flow, documentation, and private registry (the
          &quot;Service&quot;), published by Shadcn Labs. By accessing or using
          the Service, you agree to these Terms. If you use the Service for an
          organization, you represent that you can bind that organization.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">2. Eligibility and Accounts</h2>
        <p className="mt-4">
          You must be legally able to enter into this agreement. Access is
          linked to the email used at checkout or to an email assigned an
          authorized team seat. You are responsible for activity under your
          account and for keeping sign-in links, sessions, and license
          credentials confidential.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">3. Purchases and Payments</h2>
        <p className="mt-4">
          Prices are shown in USD unless stated otherwise. Dodo Payments acts as
          the merchant of record and handles payment processing, taxes,
          invoices, and applicable payment terms. A one-time purchase provides
          the access described on the applicable product page and order. Any
          refund policy shown at checkout, or rights required by applicable law,
          continue to apply.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">4. Source-Code License</h2>
        <p className="mt-4">
          Your rights to use downloaded components, blocks, documentation, and
          related source materials are governed by the{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={ROUTES.EULA}
            prefetch={false}
          >
            End User License Agreement
          </Link>
          . The{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={ROUTES.LICENSE}
            prefetch={false}
          >
            License page
          </Link>{" "}
          is a plain-language summary. If the summary conflicts with the EULA,
          the EULA controls.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">5. Acceptable Use</h2>
        <p className="mt-4">
          You may not interfere with the Service, bypass access controls, probe
          for vulnerabilities without permission, automate requests in a way
          that degrades the Service, use another person&apos;s credentials, or
          use the Service for unlawful activity. Registry access may be
          rate-limited to protect availability and enforce license terms.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          6. Service Availability and Changes
        </h2>
        <p className="mt-4">
          We may maintain, update, or change the Service and its catalog. We do
          not promise that every feature or integration will remain unchanged or
          that the hosted Service will always be uninterrupted. A perpetual
          source-code license does not guarantee perpetual hosting or support.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">7. Intellectual Property</h2>
        <p className="mt-4">
          The Service and Termcn Pro materials are owned by Shadcn Labs or its
          licensors. Your purchase grants only the rights stated in the EULA.
          Third-party software and materials remain governed by their applicable
          licenses and notices.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          8. Suspension and Termination
        </h2>
        <p className="mt-4">
          We may suspend or terminate access for a material breach, fraudulent
          purchase, credential sharing, unauthorized redistribution, security
          risk, or legal requirement. Where practical for a curable breach, we
          will provide notice and a reasonable opportunity to fix it. Sections
          that by their nature should survive termination will survive.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">9. Disclaimers</h2>
        <p className="mt-4">
          To the maximum extent permitted by law, the Service and materials are
          provided &quot;as is&quot; and &quot;as available&quot; without
          warranties of merchantability, fitness for a particular purpose,
          non-infringement, or uninterrupted operation. You are responsible for
          reviewing and testing source code before production use.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">10. Limitation of Liability</h2>
        <p className="mt-4">
          To the maximum extent permitted by law, Shadcn Labs will not be liable
          for indirect, incidental, special, consequential, exemplary, or
          punitive damages, or lost profits, revenue, data, or goodwill. Our
          aggregate liability arising from the Service or materials will not
          exceed the amount you paid for the product giving rise to the claim.
          Nothing in these Terms limits liability that cannot lawfully be
          limited.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">11. General</h2>
        <p className="mt-4">
          If part of these Terms is unenforceable, the remaining provisions stay
          in effect. A failure to enforce a provision is not a waiver. You may
          not transfer these Terms without our consent, except as part of a
          permitted business reorganization. We may update these Terms
          prospectively by posting a revised date and, for material changes,
          providing reasonable notice.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">12. Contact</h2>
        <p className="mt-4">
          For questions about these Terms, contact us at{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href="mailto:hello@termcn.dev"
          >
            hello@termcn.dev
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
