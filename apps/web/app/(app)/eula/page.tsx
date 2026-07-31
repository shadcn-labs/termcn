import { LegalPage } from "@/components/legal-page";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  description: "End User License Agreement for Termcn Pro.",
  path: ROUTES.EULA,
  title: "End User License Agreement",
});

export default function EulaPage() {
  return (
    <LegalPage title="End User License Agreement" updated="July 21, 2026">
      <section>
        <h2 className="text-base font-semibold">1. Agreement and Scope</h2>
        <p className="mt-4">
          This End User License Agreement (&quot;Agreement&quot;) is between
          Shadcn Labs, the publisher of Termcn Pro (&quot;we&quot;), and the
          person or organization identified in the applicable order
          (&quot;Licensee&quot;). It governs the components, blocks, examples,
          documentation, design guidance, and other source materials made
          available through Termcn Pro (the &quot;Materials&quot;). By
          purchasing, downloading, accessing, or using the Materials, Licensee
          accepts this Agreement.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">2. Definitions</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            <strong>Authorized User</strong> means one named human developer who
            is permitted to access or use the Materials under a valid seat.
          </li>
          <li>
            <strong>Client</strong> means a person or organization receiving
            custom professional services directly from Licensee.
          </li>
          <li>
            <strong>End Product</strong> means an application, website, terminal
            interface, or other product that incorporates the Materials and has
            substantial purpose or value beyond the Materials themselves.
          </li>
          <li>
            <strong>Seat Limit</strong> means the number of Authorized Users
            stated in Licensee&apos;s order or receipt.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          3. Personal and Team Licenses
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            A <strong>Personal License</strong> permits one Authorized User. It
            may not be shared with coworkers, contractors, clients, or other
            people.
          </li>
          <li>
            A <strong>Team License</strong> permits the organization named in
            the order to assign access to its employees and contractors, up to
            the purchased Seat Limit, while they perform work for that
            organization.
          </li>
          <li>
            Each seat belongs to one named person at a time. A seat may be
            reassigned when a person leaves the organization or no longer needs
            access, but accounts, sign-in links, access tokens, and license keys
            may not be used concurrently by multiple people.
          </li>
          <li>
            Unless an order expressly identifies a Team License and Seat Limit,
            the purchase is a Personal License for one Authorized User.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold">4. License Grant</h2>
        <p className="mt-4">
          Subject to this Agreement and payment of applicable fees, we grant
          Licensee a worldwide, perpetual, non-exclusive, non-transferable
          license for its Authorized Users to access, use, copy, and modify the
          Materials to create unlimited End Products for Licensee and unlimited
          Clients. Licensee may distribute and sell an End Product, including a
          commercial or self-hosted product, when the Materials are incorporated
          into that End Product and are not its primary value. End users of an
          End Product do not need seats merely to use that End Product.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">5. Restrictions</h2>
        <p className="mt-4">Licensee and its Authorized Users may not:</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>
            share the Materials or registry access with anyone who is not an
            Authorized User;
          </li>
          <li>
            resell, sublicense, publish, or redistribute the Materials or their
            derivatives separately from a permitted End Product;
          </li>
          <li>
            use the Materials to create or supply a competing component library,
            template or starter-kit catalog, UI builder, code generator,
            marketplace, or training dataset whose primary value is the
            Materials or derivatives of them;
          </li>
          <li>
            publish the Materials or derivatives in a public repository or other
            location from which they can be extracted for reuse;
          </li>
          <li>
            share, sell, or expose an account, magic link, session, access
            token, or license key, or circumvent access controls and usage
            limits; or
          </li>
          <li>
            remove proprietary notices or claim ownership of the unmodified
            Materials.
          </li>
        </ul>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          6. Accounts, Keys, and Verification
        </h2>
        <p className="mt-4">
          Personal access is tied to the checkout email. Team access is tied to
          named member emails assigned by the team owner. Licensee must protect
          all access credentials and promptly report suspected compromise. We
          may use proportionate technical controls, rate limits, and access logs
          to validate entitlement and detect credential sharing. We may rotate
          or revoke a compromised credential and require re-verification without
          ending a valid underlying license.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          7. Ownership and Third-Party Materials
        </h2>
        <p className="mt-4">
          Shadcn Labs and its licensors retain ownership of the Materials and
          all rights not expressly granted here. Licensee owns its original End
          Product code and modifications, subject to our rights in the
          underlying Materials. Third-party packages, code, and assets are
          governed by their respective licenses and notices, which this
          Agreement does not replace.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">8. Updates and Support</h2>
        <p className="mt-4">
          If an order includes lifetime updates, that means access to updates we
          release for the purchased product while Termcn Pro continues to offer
          them. It does not guarantee a particular update schedule, feature,
          integration, hosting period, or level of support.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">
          9. Enforcement and Termination
        </h2>
        <p className="mt-4">
          This license remains effective unless terminated for material breach.
          We may suspend registry access while investigating suspected fraud,
          credential sharing, or redistribution. Where practical for a curable
          breach, we will provide notice and a reasonable opportunity to cure.
          Upon termination, Licensee must stop new use of the Materials and
          delete accessible source copies. Lawfully distributed End Products may
          continue to be used by their end users unless the End Product itself
          violates this Agreement.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">10. Warranty Disclaimer</h2>
        <p className="mt-4">
          To the maximum extent permitted by law, the Materials are provided
          &quot;as is&quot; and &quot;as available&quot; without warranties of
          merchantability, fitness for a particular purpose, non-infringement,
          accuracy, or error-free operation. Licensee is responsible for code
          review, security review, testing, and compliance of its End Products.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">11. Limitation of Liability</h2>
        <p className="mt-4">
          To the maximum extent permitted by law, Shadcn Labs will not be liable
          for indirect, incidental, special, consequential, exemplary, or
          punitive damages, or lost profits, revenue, data, or goodwill. Our
          aggregate liability arising from the Materials will not exceed the
          license fee paid for them. Nothing in this Agreement limits liability
          that cannot lawfully be limited.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">12. General</h2>
        <p className="mt-4">
          This Agreement, the applicable order, and the Terms of Service are the
          complete agreement concerning the Materials. An order controls only if
          it expressly changes this Agreement. If a provision is unenforceable,
          the remaining provisions stay effective. Failure to enforce a
          provision is not a waiver. Licensee may not transfer this Agreement
          without our written consent, except with substantially all assets of a
          business that purchased a Team License and assumes this Agreement.
        </p>
      </section>
      <section>
        <h2 className="text-base font-semibold">13. Contact</h2>
        <p className="mt-4">
          For licensing questions, contact us at{" "}
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
