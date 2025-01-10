import { ghostApi, ghostUrl } from "@/app/(doc)/blog/constants";
import { env } from "@/lib/env";
import { useMDXComponents } from "@/mdx-components";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createElement } from "react";
import { parse } from "node-html-parser";
import { getExcerpt } from "@/app/(doc)/blog/helpers";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!ghostApi) {
    return {
      title: `Not Found | Blog`,
      description: `This blog post doesn't exist.`,
    };
  }
  const post = await ghostApi.posts.read({ slug });
  const excerpt = getExcerpt(post.excerpt);

  return {
    title: `${post.title || "Not found"} | Blog`,
    description: excerpt || `Check out this blog post on Augend.`,
  };
}

export default async function Page({ params }: Props) {
  if (!ghostApi || !ghostUrl) {
    return notFound();
  }
  const { slug } = await params;
  const post = await ghostApi.posts.read({ slug });
  let html = post.html;
  if (!html) {
    return notFound();
  }
  const siteUrl = new URL(env.NEXT_PUBLIC_SITE_URL);
  html = html.replace(ghostUrl.hostname, siteUrl.hostname);

  return (
    <div className="w-full flex flex-col items-center flex-1 text-foreground/90">
      <div className="w-full flex flex-col justify-center max-w-3xl px-5 md:px-12 pt-4 md:pt-6 pb-20">
        <h1 className="font-bold text-4xl text-foreground text-center text-balance">
          {post.title}
        </h1>
        <div className="w-full flex flex-wrap mt-2">
          <HTMLRenderer html={html} />
        </div>
      </div>
    </div>
  );
}

const ATTR_MAP: Record<string, string> = {
  class: "className",
  srcset: "srcSet",
  colspan: "colSpan",
  rowspan: "rowSpan",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
};

function convertAttributes(attrs: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(attrs)) {
    const reactKey = ATTR_MAP[key.toLowerCase()] || key;
    result[reactKey] = value;
  }

  return result;
}

function HTMLRenderer({ html }: { html: string }) {
  const components = useMDXComponents({});

  const createReactElement = (node: any): React.ReactNode => {
    // Handle text nodes
    if (node.nodeType === 3) {
      return node.text;
    }

    // Skip if not an element
    if (node.nodeType !== 1) {
      return null;
    }

    const tagName = node.tagName.toLowerCase();
    const Component = components[tagName];

    if (!Component) {
      return null;
    }

    // Convert attributes to props
    const props = convertAttributes(node.attributes || {});

    // Recursively process child nodes
    const children = node.childNodes.map(createReactElement).filter(Boolean);

    // @ts-ignore
    return createElement(Component, {
      key: Math.random().toString(36).substr(2, 9),
      ...props,
      children,
    });
  };

  const root = parse(html);
  const content = root.childNodes.map(createReactElement).filter(Boolean);

  return <>{content}</>;
}
