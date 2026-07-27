import { DirectionalTransition } from "@/components/directional-transition";

export const LegalPage = ({
  children,
  title,
  updated,
}: {
  children: React.ReactNode;
  title: string;
  updated: string;
}) => (
  <DirectionalTransition>
    <article className="mx-auto w-full max-w-[720px] px-5 pt-20 pb-24 sm:px-8 sm:pt-28 sm:pb-32">
      <header>
        <h1 className="font-mono text-2xl font-medium tracking-tight">
          {title}
        </h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm tracking-wide">
          Last updated: {updated}
        </p>
      </header>
      <div className="mt-14 space-y-6 text-[15px] leading-7 sm:mt-16 sm:text-base sm:leading-8">
        {children}
      </div>
    </article>
  </DirectionalTransition>
);
