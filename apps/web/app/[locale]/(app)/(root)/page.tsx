import { useIntlayer } from "next-intlayer/server";

import { CommandBox } from "@/components/command-box";
import { ComponentPreview } from "@/components/component-preview";
import { DirectionalTransition } from "@/components/directional-transition";
import { HomeCtas } from "@/components/home-ctas";
import { PageHero } from "@/components/page-hero";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

export const dynamic = "force-static";
export const revalidate = false;

export default async function IndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = useIntlayer("home-page", locale);

  const showcaseItems = [
    {
      className: "md:col-span-2",
      name: "table-demo",
      title: String(content.showcaseTable),
    },
    {
      name: "bar-chart-demo",
      title: String(content.showcaseBarChart),
    },
    {
      name: "spinner-demo",
      title: String(content.showcaseSpinner),
    },
    {
      name: "alert-demo",
      title: String(content.showcaseAlert),
    },
    {
      name: "tool-call-demo",
      title: String(content.showcaseToolCall),
    },
    {
      className: "md:col-span-2",
      name: "badge-demo",
      title: String(content.showcaseBadge),
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd
        items={[{ name: content.breadcrumbHome.value, path: ROUTES.HOME }]}
      />
      <DirectionalTransition>
        <section className="container-wrapper relative">
          <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
            <PageHero
              description={
                <>
                  {content.descriptionLine1}{" "}
                  <br className="hidden sm:block" />
                  {content.descriptionLine2}
                </>
              }
              descriptionClassName="max-w-2xl text-lg sm:text-xl"
              title={content.title}
              titleClassName="max-w-7xl"
            />

            <CommandBox className="mt-4 w-full max-w-xl" />

            <HomeCtas className="mt-4" />
          </div>
        </section>

        <section className="container-wrapper pb-8 lg:pb-12">
          <div className="container">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {showcaseItems.map((item) => (
                <ComponentPreview
                  key={item.name}
                  className={cn("mt-0 h-full", item.className)}
                  title={item.title}
                  name={item.name}
                  hideCode
                />
              ))}
            </div>
          </div>
        </section>
      </DirectionalTransition>
    </>
  );
}
