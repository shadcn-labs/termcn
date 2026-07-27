import Link from "next/link";

import { LegalPage } from "@/components/legal-page";
import { ROUTES } from "@/constants/routes";
import { createPageMetadata } from "@/seo/metadata";

export const metadata = createPageMetadata({
  description: "Plain-language Termcn Pro license summary.",
  path: ROUTES.LICENSE,
  title: "License",
});

export default function LicensePage() {
  return (
    <LegalPage title="License" updated="July 21, 2026">
      <section>
        <h2 className="text-base font-semibold">The Short Version</h2>
        <p className="mt-4">
          Buy the right number of seats for the people who can access Termcn Pro
          source. Those people can use and modify it to build unlimited
          personal, commercial, internal, and client End Products. Do not share
          the source or access credentials outside those licensed people, and do
          not repackage the source into a competing library, template catalog,
          builder, generator, or marketplace.
        </p>
        <p className="text-muted-foreground mt-4 text-sm leading-7">
          This page is a readable summary, not a substitute for the binding{" "}
          <Link
            className="text-foreground underline underline-offset-4"
            href={ROUTES.EULA}
            prefetch={false}
          >
            End User License Agreement
          </Link>
          . If the two differ, the EULA controls.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold">Choose the Right License</h2>
        <div className="mt-4 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium">License</th>
                <th className="px-4 py-3 font-medium">Who may access source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-4 py-3 font-medium">Personal</td>
                <td className="px-4 py-3">One named developer</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Team</td>
                <td className="px-4 py-3">
                  Named employees and contractors, up to the Seat Limit on the
                  order
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4">
          Seats count people with source or registry access. They do not count
          projects, repositories, clients, deployments, or end users of a
          finished application.
        </p>
      </section>

      <section>
        <h2 className="text-base font-semibold">You May</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>build unlimited End Products for yourself or your company;</li>
          <li>build unlimited custom End Products for unlimited Clients;</li>
          <li>use End Products commercially and charge their end users;</li>
          <li>modify the source to fit your product; and</li>
          <li>
            distribute a finished or self-hosted End Product when its primary
            value is not the Termcn Pro source itself.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold">You May Not</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>share one Personal license with another developer;</li>
          <li>
            give Team access to more people than the purchased Seat Limit;
          </li>
          <li>
            publish, sell, sublicense, or give away the source or derivatives as
            reusable components, blocks, templates, or starter kits;
          </li>
          <li>
            include the source in a public repository where it can be extracted
            and reused;
          </li>
          <li>
            use it as the content of a competing UI library, builder, code
            generator, marketplace, or training dataset; or
          </li>
          <li>
            share, sell, or expose a login, session, access token, or license
            key.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold">Common Examples</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5">
          <li>
            <strong>Allowed:</strong> a commercial CLI, internal terminal
            dashboard, SaaS admin tool, or custom application for one client.
          </li>
          <li>
            <strong>Not allowed:</strong> publishing a collection of Termcn Pro
            ports, selling a TUI starter kit containing the source, or giving
            customers a way to download the underlying components.
          </li>
          <li>
            <strong>Needs another seat:</strong> a second developer, coworker,
            or contractor needs to inspect, install, copy, or modify the source.
          </li>
          <li>
            <strong>Does not need another seat:</strong> a customer or employee
            only uses the finished application and cannot access the source.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-base font-semibold">Questions</h2>
        <p className="mt-4">
          If your use case is unclear, contact{" "}
          <a
            className="text-foreground underline underline-offset-4"
            href="mailto:hello@termcn.dev"
          >
            hello@termcn.dev
          </a>{" "}
          before distributing the product.
        </p>
      </section>
    </LegalPage>
  );
}
