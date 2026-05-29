import { CommandBox } from "@/components/command-box";
import { ComponentPreview } from "@/components/component-preview";
import { DirectionalTransition } from "@/components/directional-transition";
import { HomeCtas } from "@/components/home-ctas";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

export const dynamic = "force-static";
export const revalidate = false;

const showcaseItems = [
  {
    className: "md:col-span-2",
    name: "table-demo",
    title: "Table",
  },
  {
    name: "bar-chart-demo",
    title: "Bar Chart",
  },
  {
    name: "spinner-demo",
    title: "Spinner",
  },
  {
    name: "alert-demo",
    title: "Alert",
  },
  {
    name: "tool-call-demo",
    title: "Tool Call",
  },
  {
    className: "md:col-span-2",
    name: "badge-demo",
    title: "Badge",
  },
];

export default function IndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
      <DirectionalTransition>
        <section className="container-wrapper relative">
          <div className="container flex flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
            <h1 className="max-w-7xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-transparent">
              Beautiful terminal UIs, made simple
            </h1>

            <p className="max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Ready to use, customizable terminal components for React.
              <br className="hidden sm:block" />
              Built on Ink and OpenTUI. Distributed via shadcn.
            </p>

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
