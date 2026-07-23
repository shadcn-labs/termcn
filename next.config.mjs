import { createMDX } from "fumadocs-mdx/next";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

const { LINK } = await jiti.import("./constants/links");
const { ROUTES } = await jiti.import("./constants/routes");

/** Turbopack requires project-relative alias targets (not absolute paths). */
const opentuiJsxRuntimeTurbo = "./lib/opentui-bridge/react-jsx-runtime.ts";
const opentuiJsxDevRuntimeTurbo =
  "./lib/opentui-bridge/react-jsx-dev-runtime.ts";
const inkWebAdapterTurbo = "./lib/ink-web-adapter.ts";

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
  headers() {
    const link = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</openapi.json>; rel="service-desc"',
      '</docs>; rel="service-doc"',
      `<${LINK.SHADCN_MCP_DOCS}>; rel="service-doc"; title="shadcn MCP server"`,
      '</.well-known/agent-skills/index.json>; rel="describedby"',
    ].join(", ");

    return [{ headers: [{ key: "Link", value: link }], source: ROUTES.HOME }];
  },
  images: {
    remotePatterns: [
      {
        hostname: "avatars.githubusercontent.com",
        protocol: "https",
      },
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./registry/**/*"],
  },
  redirects() {
    return [
      {
        destination: `${ROUTES.DOCS}.md`,
        permanent: true,
        source: `${ROUTES.DOCS}.mdx`,
      },
      {
        destination: `${ROUTES.DOCS}/:path*.md`,
        permanent: true,
        source: `${ROUTES.DOCS}/:path*.mdx`,
      },
      {
        destination: `${ROUTES.DOCS_COMPONENTS}/ink/:category/:component`,
        permanent: true,
        source: `${ROUTES.DOCS_COMPONENTS}/:category((?!ink|opentui|charts)[^/]+)/:component`,
      },
      {
        destination: `${ROUTES.DOCS_TEMPLATES}/ink/:template`,
        permanent: true,
        source: `${ROUTES.DOCS_TEMPLATES}/:template((?!ink|opentui)[^/]+)`,
      },
      {
        destination: `${ROUTES.DOCS}/themes/ink/:theme`,
        permanent: true,
        source: `${ROUTES.DOCS}/themes/:theme((?!ink|opentui)[^/]+)`,
      },
      {
        destination: `${ROUTES.DOCS_CHARTS}/:base`,
        permanent: true,
        source: `${ROUTES.DOCS_COMPONENTS}/:base(ink|opentui)/charts`,
      },
      {
        destination: `${ROUTES.DOCS_CHARTS}/:base/:chart`,
        permanent: true,
        source: `${ROUTES.DOCS_COMPONENTS}/:base(ink|opentui)/charts/:chart`,
      },
    ];
  },
  rewrites() {
    return {
      // Legacy flat registry URLs → canonical nested paths under public/r/{ink,opentui}/.
      // registry.json stays at /r/registry.json (served as a static file before these run).
      afterFiles: [
        {
          destination: "/r/opentui/:slug.json",
          source: "/r/opentui-:slug.json",
        },
        {
          destination: "/r/ink/:slug.json",
          source: "/r/:slug.json",
        },
      ],
    };
  },
  turbopack: {
    resolveAlias: {
      "@opentui/react": "@gridland/utils",
      "@opentui/react/jsx-dev-runtime": opentuiJsxDevRuntimeTurbo,
      "@opentui/react/jsx-runtime": opentuiJsxRuntimeTurbo,
      ink: inkWebAdapterTurbo,
    },
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
