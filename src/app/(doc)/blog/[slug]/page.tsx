import { ghostApi, ghostUrl } from "@/app/(doc)/blog/constants";
import { getExcerpt } from "@/app/(doc)/blog/helpers";
import ScIcon from "@/components/icons/sc-icon";
import { LinkButton } from "@/components/ui/button";
import { sc } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useMDXComponents } from "@/mdx-components";
import { format } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { parse } from "node-html-parser";
import { createElement, CSSProperties } from "react";

type Props = {
  params: Promise<{ slug: string }>;
};

const getPost = async (slug: string) => {
  if (!ghostApi || !ghostUrl) {
    return notFound();
  }
  const post = await ghostApi.posts.read({ slug }, { include: ["authors"] });
  return post;
};

export default async function Page({ params }: Props) {
  if (!ghostApi || !ghostUrl) {
    return notFound();
  }
  const { slug } = await params;
  const post = await getPost(slug);
  let html = post.html;
  if (!html) {
    return notFound();
  }
  const authors = post.authors;

  return (
    <div className="w-full flex flex-col items-center flex-1 text-foreground/90">
      <div className="w-full pt-0 md:pt-4 lg:pt-8 pb-16 px-5 md:px-12 flex flex-col items-center lg:items-start lg:flex-row justify-center">
        <TOC className="lg:pr-6" />
        <div className="w-full mt-3 lg:mt-0 flex flex-col justify-center max-w-2xl">
          <div className="w-full flex flex-col items-center">
            <h1 className="font-bold text-4xl text-foreground text-center text-balance px-3">
              {post.title}
            </h1>
            {post.published_at && (
              <p className="mt-4 text-muted-foreground">
                {post.published_at && (
                  <span>
                    {format(new Date(post.published_at), "MMMM dd, yyyy")}
                  </span>
                )}
                {post.published_at && post.reading_time && (
                  <span className="text-muted-more-foreground">{" • "}</span>
                )}
                {post.reading_time && <span>{post.reading_time} min read</span>}
              </p>
            )}
            {authors && (
              <p className="mt-1 text-muted-foreground font-semibold">
                {authors.map((author, index) => (
                  <span key={author.id}>
                    <a
                      target="_blank"
                      href={
                        author.twitter
                          ? `https://x.com/${author.twitter.slice(1)}`
                          : sc.x.href
                      }
                      className="px-1 not-touch:hover:underline active:underline not-touch:hover:text-foreground active:text-foreground
                      focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm"
                    >
                      {author.name}
                    </a>
                    {index < authors.length - 1 && (
                      <span className="text-muted-more-foreground">
                        {" • "}
                      </span>
                    )}
                  </span>
                ))}
              </p>
            )}
          </div>
          {/* Blog post content */}
          <div className="w-full flex flex-wrap mt-2">
            <HTMLRenderer html={html} />
          </div>
          {/* Join us section */}
          <div className="w-full flex flex-col items-center border rounded-lg px-4 pt-3.5 pb-5 bg-background mt-10">
            <p className="text-2xl font-bold leading-snug">Join Us</p>
            <div className="w-full flex flex-wrap items-center gap-2 justify-center mt-3">
              {Object.values(sc)
                .filter((i) => i.joinable)
                .sort((a, b) => a.xOrder - b.xOrder)
                .map((i) => (
                  <LinkButton
                    key={i.slug}
                    aria-label={i.name}
                    href={i.siteHref}
                    className="p-1.5 rounded-lg"
                    variant="outline"
                    target="_blank"
                  >
                    <ScIcon slug={i.slug} className="size-6 shrink-0" />
                  </LinkButton>
                ))}
            </div>
          </div>
          {/* Back to blog */}
          <div className="w-full flex items-center justify-center mt-5">
            <LinkButton
              href="/blog"
              variant="ghost"
              className="text-muted-foreground gap-1.5"
            >
              <ArrowLeftIcon className="size-5 -my-1 -ml-1.25" />
              Back to Blog
            </LinkButton>
          </div>
        </div>
        <TOC disabled={true} className="lg:pl-6 hidden lg:block" />
      </div>
    </div>
  );
}

function TOC({
  className,
  disabled,
}: {
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      data-disabled={disabled ? true : undefined}
      className={cn(
        "flex shrink-0 flex-col group/toc data-[disabled]/toc:opacity-0 group-data-[disabled]/toc:pointer-events-none",
        className
      )}
    >
      <LinkButton
        href="/blog"
        size="sm"
        variant="ghost"
        className="text-muted-foreground gap-1.5"
      >
        <ArrowLeftIcon className="size-4 -my-1 -ml-1" />
        Blog
      </LinkButton>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!ghostApi) {
    return {
      title: `Not Found | Blog`,
      description: `This blog post doesn't exist.`,
    };
  }

  const { slug } = await params;
  const post = await getPost(slug);
  const excerpt = getExcerpt(post.excerpt);
  const title = `${post.title || "Not found"} | Blog`;
  const description = excerpt || `Check out this blog post on Augend.`;

  return {
    title,
    description,
    openGraph: post.feature_image
      ? {
          images: [
            {
              url: post.feature_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        }
      : undefined,
    twitter: post.feature_image
      ? {
          title: title,
          description,
          card: "summary_large_image",
          images: [
            {
              url: post.feature_image,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ],
        }
      : undefined,
  };
}

export async function generateStaticParams() {
  if (!ghostApi) return [];
  const posts = await ghostApi.posts.browse({
    limit: 100,
  });
  return posts.map((post) => ({
    slug: post.slug,
  }));
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

    // Handle style attribute specially
    if (reactKey === "style" && typeof value === "string") {
      result[reactKey] = parseStyle(value);
    } else {
      result[reactKey] = value;
    }
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
      console.warn(`No component found for tag: ${tagName}`);
      return null;
    }

    // Convert attributes to props
    const props = convertAttributes(node.attributes || {});

    // Recursively process child nodes
    const children = node.childNodes.map(createReactElement).filter(Boolean);

    // @ts-ignore
    return createElement(Component, {
      key: Math.random().toString(36).slice(2, 9),
      ...props,
      children,
    });
  };

  const root = parse(html);
  const content = root.childNodes.map(createReactElement).filter(Boolean);

  return <>{content}</>;
}

function parseStyle(styleString: string): CSSProperties {
  if (!styleString) return {};

  return styleString
    .split(";")
    .filter((style) => style.trim())
    .reduce((acc, style) => {
      const [property, value] = style.split(":").map((str) => str.trim());

      // Convert kebab-case to camelCase
      const camelProperty = property.replace(/-([a-z])/g, (g) =>
        g[1].toUpperCase()
      );

      return {
        ...acc,
        [camelProperty]: value,
      };
    }, {});
}
