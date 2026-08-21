import createMDX from "@next/mdx";

const publicStaticCacheHeader = {
  key: "Cache-Control",
  value: "public, s-maxage=31536000",
};

const publicStaticRoutes = [
  "/blog/:path*",
  "/terms",
  "/privacy",
  "/support",
  "/x",
  "/twitter",
  "/discord",
  "/github",
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway runs the server in a fixed-size container. Keep Next's optional
  // in-process incremental cache bounded; application data is already cached
  // in Redis/Postgres.
  cacheMaxMemorySize: 16 * 1024 * 1024,
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  async headers() {
    return [
      ...publicStaticRoutes.map((route) => ({
        source: route,
        headers: [publicStaticCacheHeader],
      })),
    ];
  },
  async rewrites() {
    if (
      !process.env.NEXT_PUBLIC_POSTHOG_HOST ||
      !process.env.NEXT_PUBLIC_POSTHOG_HOST_ASSETS
    ) {
      return [];
    }
    return [
      {
        source: "/ingest/static/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST_ASSETS}/static/:path*`,
      },
      {
        source: "/ingest/:path*",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/:path*`,
      },
      {
        source: "/ingest/decide",
        destination: `${process.env.NEXT_PUBLIC_POSTHOG_HOST}/decide`,
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      ["rehype-slug"],
      [
        "rehype-autolink-headings",
        { behavior: "append", test: ["h2", "h3", "h4", "h5", "h6"] },
      ],
    ],
  },
});

export default withMDX(nextConfig);
