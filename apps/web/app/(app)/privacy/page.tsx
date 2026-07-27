import { LegalPage } from "@/components/legal-page";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  description: "Privacy policy for Termcn Pro.",
  path: ROUTES.PRIVACY,
  title: "Privacy Policy",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="July 21, 2026">
      <section>
        <h2 className="text-base font-semibold">1. Scope and Controller</h2>
        <p className="mt-4">
          This policy explains how Shadcn Labs, the publisher of Termcn Pro
          (&quot;Termcn Pro,&quot; &quot;we,&quot; or &quot;us&quot;), handles
          personal data when you visit the website, purchase a product, sign in,
          or access the private registry. For this account, billing, and access
          data, Shadcn Labs acts as the data controller.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">2. Information We Collect</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            <strong>Account data:</strong> your email address, authentication
            identifiers, and session information.
          </li>
          <li>
            <strong>Purchase data:</strong> the product, amount, currency,
            payment status, and customer, payment, and license identifiers. Dodo
            Payments handles your payment-method details; we do not store full
            card details.
          </li>
          <li>
            <strong>Registry and security data:</strong> license-key and
            access-token hashes, requested resources, timestamps, and technical
            request information such as IP address and user agent when available
            in service logs. We do not store plaintext license keys in our
            application database.
          </li>
          <li>
            <strong>Analytics data:</strong> aggregated page views, referrers,
            approximate location, browser, operating system, and device type
            collected through Vercel Web Analytics.
          </li>
          <li>
            <strong>Communications:</strong> information you include when you
            contact us for support or licensing questions.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          3. How and Why We Use Information
        </h2>
        <p className="mt-4">
          We use personal data to complete purchases, authenticate customers,
          provide licensed content, deliver magic-link emails, prevent fraud and
          license abuse, support customers, maintain and improve the Service,
          and comply with legal obligations. Depending on your location, our
          legal bases are performance of a contract, our legitimate interests in
          operating and securing the Service, compliance with law, and consent
          where consent is required.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          4. Service Providers and Disclosures
        </h2>
        <p className="mt-4">
          We use Dodo Payments for checkout and merchant-of-record services,
          Convex for application data and authentication infrastructure, Resend
          for transactional email, GitHub for private source storage, and Vercel
          for hosting and privacy-focused web analytics. These providers process
          data under their own terms or on our behalf as applicable. We may also
          disclose information when required by law, to protect rights and
          security, or in connection with a business reorganization. We do not
          sell personal data or share it for targeted advertising.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">5. Cookies and Analytics</h2>
        <p className="mt-4">
          We use essential storage and cookies for sessions, theme preferences,
          and interface state. Vercel Web Analytics does not use cookies and
          reports aggregated traffic data. We do not use advertising cookies.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">6. Retention and Security</h2>
        <p className="mt-4">
          We retain account, purchase, and license records while needed to
          provide lifetime access and for legal, accounting, fraud-prevention,
          and dispute-resolution purposes. Authentication, analytics, and
          security records are kept only as long as reasonably necessary for
          their purpose. We use access controls, hashed credentials, and secure
          service providers, but no online system can be guaranteed completely
          secure.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          7. International Data Transfers
        </h2>
        <p className="mt-4">
          Our providers may process information in countries other than yours.
          Where required, transfers are protected through recognized safeguards
          such as adequacy decisions or contractual protections.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">8. Your Rights</h2>
        <p className="mt-4">
          Depending on where you live, you may request access, correction,
          deletion, restriction, objection, or portability of your personal
          data, and may complain to your local data-protection authority. We may
          need to verify your identity and may retain information where the law
          permits or requires it. Deleting data needed to verify a purchase may
          end account or registry access.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">9. Children</h2>
        <p className="mt-4">
          Termcn Pro is a professional developer product and is not directed to
          children. We do not knowingly collect personal data from children
          under the age at which they may consent to online services in their
          jurisdiction.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">10. Changes and Contact</h2>
        <p className="mt-4">
          We may update this policy and will post the revised date on this page.
          For privacy questions or requests, contact us at{" "}
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
