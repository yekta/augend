import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
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
