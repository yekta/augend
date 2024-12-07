import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { h } from "hastscript";
import rehypeSlug from "rehype-slug";

const nextConfig: NextConfig = {
  pageExtensions: ["tsx", "ts", "jsx", "js", "mdx", "md"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      [rehypeSlug],
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            ariaHidden: true,
            tabIndex: -1,
            class: "heading-anchor",
          },
          test: (node: any) => node.tagName !== "h1",
          content(node: any) {
            return [h("span.heading-anchor-span.font-normal", "#")];
          },
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
