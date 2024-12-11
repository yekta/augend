import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      ["rehype-slug"],
      ["rehype-autolink-headings", { behavior: "append" }],
    ],
  },
});

export default withMDX(nextConfig);
