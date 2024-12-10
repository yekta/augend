import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],
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
