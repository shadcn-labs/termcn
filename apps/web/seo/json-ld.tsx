import { getIntlayer } from "intlayer";

import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";

const JsonLdScript = ({ data }: { data: Record<string, unknown> }) => (
  <script
    // eslint-disable-next-line react/no-danger
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    type="application/ld+json"
  />
);

export const WebsiteJsonLd = ({ locale }: { locale?: string }) => {
  const content = getIntlayer("json-ld", locale);
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    description: SITE.DESCRIPTION.LONG,
    inLanguage: content.inLanguage,
    name: SITE.NAME,
    url: SITE.URL,
  };
  return <JsonLdScript data={data} />;
};

export const SoftwareSourceCodeJsonLd = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    applicationCategory: "DeveloperApplication",
    author: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.PORTFOLIO,
    },
    codeRepository: LINK.GITHUB,
    dateModified: new Date().toISOString().split("T")[0],
    description: SITE.DESCRIPTION.LONG,
    isAccessibleForFree: true,
    keywords: SITE.KEYWORDS,
    license: LINK.LICENSE,
    maintainer: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.PORTFOLIO,
    },
    name: SITE.NAME,
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "USD",
    },
    programmingLanguage: ["TypeScript", "React", "Next.js"],
    runtimePlatform: "Node.js",
    url: SITE.URL,
  };
  return <JsonLdScript data={data} />;
};

export const OrganizationJsonLd = () => {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    founder: {
      "@type": "Person",
      name: SITE.AUTHOR.NAME,
      url: LINK.PORTFOLIO,
    },
    logo: SITE.OG_IMAGE,
    name: SITE.NAME,
    sameAs: [LINK.GITHUB, LINK.PORTFOLIO, LINK.X],
    url: SITE.URL,
  };
  return <JsonLdScript data={data} />;
};

export const FAQJsonLd = ({ locale }: { locale?: string }) => {
  const content = getIntlayer("json-ld", locale);
  const faqs = [
    {
      answer: content.faqWhatIsAnswer,
      question: content.faqWhatIsQuestion,
    },
    {
      answer: content.faqPublishAnswer,
      question: content.faqPublishQuestion,
    },
    {
      answer: content.faqOpenSourceAnswer,
      question: content.faqOpenSourceQuestion,
    },
  ];

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
      name: faq.question,
    })),
  };
  return <JsonLdScript data={data} />;
};

export const BreadcrumbJsonLd = ({
  items,
}: {
  items: { name: string; path: string }[];
}) => {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const pathname = item.path.startsWith(ROUTES.HOME)
        ? item.path
        : `${ROUTES.HOME}${item.path}`;
      return {
        "@type": "ListItem",
        item: `${SITE.URL}${pathname}`,
        name: item.name,
        position: index + 1,
      };
    }),
  };
  return <JsonLdScript data={data} />;
};

export const JsonLdScripts = ({ locale }: { locale?: string }) => (
  <>
    <WebsiteJsonLd locale={locale} />
    <SoftwareSourceCodeJsonLd />
    <OrganizationJsonLd />
    <FAQJsonLd locale={locale} />
  </>
);
