import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  description: "Data Processing Addendum information for Termcn Pro.",
  path: ROUTES.DPA,
  title: "Data Processing Addendum",
});

export default function DpaPage() {
  return (
    <LegalPage title="Data Processing Addendum" updated="July 21, 2026">
      <section>
        <h2 className="text-base font-semibold">When a DPA Applies</h2>
        <p className="mt-4">
          A data processing addendum is used when one business processes
          personal data on another business&apos;s documented instructions.
          Termcn Pro is a source-code registry and does not host or process the
          personal data handled by applications you build with its source.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          Account and Purchase Information
        </h2>
        <p className="mt-4">
          For purchaser emails, team-member emails, authentication, payments,
          registry access, security, and support, Shadcn Labs generally decides
          why and how the information is used and therefore acts as a data
          controller. Our{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={ROUTES.PRIVACY}
            prefetch={false}
          >
            Privacy Policy
          </Link>{" "}
          explains that processing. A customer is not the controller of this
          ordinary Termcn Pro account data merely because it purchased a Team
          License.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">Enterprise Requests</h2>
        <p className="mt-4">
          If a separately agreed enterprise service requires Shadcn Labs to
          process personal data solely on your documented instructions, contact
          us before sending that data. We will evaluate the processing roles
          and, where legally required, provide a DPA describing the subject
          matter, duration, data categories, security measures, subprocessors,
          deletion, and transfer safeguards. A DPA applies only when executed or
          otherwise expressly incorporated into an order.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="mt-4">
          For enterprise privacy or DPA requests, contact us at{" "}
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
