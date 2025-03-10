import { getHighlighter } from "@/app/(doc)/blog/shiki";
import ImageWithFullscreen from "@/components/doc/image-with-fullscreen";
import { cn } from "@/components/ui/utils";
import type { MDXComponents } from "mdx/types";
import { ComponentProps } from "react";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, className, ...rest }) => (
      <h1
        {...rest}
        className={cn(
          "max-w-full leading-[1.15] text-4xl px-3 md:px-8 text-foreground text-balance text-center font-bold mt-14 first-of-type:mt-0",
          className
        )}
      >
        {children}
      </h1>
    ),
    h2: ({ children, className, ...rest }) => (
      <h2
        {...rest}
        className={cn(
          "max-w-full leading-tight text-3xl text-foreground text-balance font-bold mt-12 [h1+&]:mt-3",
          className
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ children, className, ...rest }) => (
      <h3
        {...rest}
        className={cn(
          "max-w-full leading-snug text-2xl text-foreground text-balance font-bold mt-10 [h1+&]:mt-3 [h2+&]:mt-3",
          className
        )}
      >
        {children}
      </h3>
    ),
    h4: ({ children, className, ...rest }) => (
      <h4
        {...rest}
        className={cn(
          "max-w-full leading-snug text-xl text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3",
          className
        )}
      >
        {children}
      </h4>
    ),
    h5: ({ children, className, ...rest }) => (
      <h5
        {...rest}
        className={cn(
          "max-w-full leading-snug text-lg text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3 [h4+&]:mt-3",
          className
        )}
      >
        {children}
      </h5>
    ),
    h6: ({ children, className, ...rest }) => (
      <h6
        {...rest}
        className={cn(
          "max-w-full leading-snug text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3 [h4+&]:mt-3 [h5+&]:mt-3",
          className
        )}
      >
        {children}
      </h6>
    ),
    p: ({ children, className, ...rest }) => (
      <p
        {...rest}
        className={cn(
          "w-full leading-relaxed mt-4 [blockquote+&]:mt-6 [figure+&]:mt-6 [pre+&]:mt-6 [.shiki-div+&]:mt-6 [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2 [h5+&]:mt-2 [h6+&]:mt-2 [blockquote>&]:mt-0 [blockquote>&]:italic",
          className
        )}
      >
        {children}
      </p>
    ),
    ol: ({ children, className, ...rest }) => (
      <ol
        {...rest}
        className={cn(
          "mt-4 pl-6 list-decimal [p+&]:mt-2 [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2",
          className
        )}
      >
        {children}
      </ol>
    ),
    ul: ({ children, className, ...rest }) => (
      <ul
        {...rest}
        className={cn(
          "mt-4 pl-8 list-disc [p+&]:mt-2 [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2",
          className
        )}
      >
        {children}
      </ul>
    ),
    li: ({ children, className, ...rest }) => (
      <li {...rest} className={cn("mt-2", className)}>
        {children}
      </li>
    ),
    a: ({ children, className, href, ...rest }) => (
      <a
        {...rest}
        href={href}
        target={
          href?.startsWith("/") || href?.startsWith("#") ? undefined : "_blank"
        }
        className={cn(
          `underline not-touch:hover:opacity-80 active:opacity-80 focus-visible:ring-1 focus-visible:ring-primary/50 
          focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm 
          [.kg-button-card>&]:bg-primary [.kg-button-card>&]:max-w-full [.kg-button-card>&]:text-background [.kg-button-card>&]:font-bold
          [.kg-button-card>&]:no-underline [.kg-button-card>&]:px-4 [.kg-button-card>&]:text-base [.kg-button-card>&]:py-2.75 [.kg-button-card>&]:rounded-lg
          active:[.kg-button-card>&]:opacity-100 not-touch:[.kg-button-card>&]:hover:opacity-100 active:[.kg-button-card>&]:bg-primary/85 
          not-touch:[.kg-button-card>&]:hover:bg-primary/85 [.kg-button-card>&]:text-center [.kg-button-card>&]:leading-tight`
        )}
      >
        {children}
      </a>
    ),
    div: ({ children, className, ...rest }) => (
      <div {...rest} className={cn("w-full mt-4 flex", className)}>
        {children}
      </div>
    ),
    img: (props) => <ImageWithFullscreen {...props} />,
    pre: async ({ children, className, ...rest }) => {
      const highlighter = await getHighlighter();

      const content = children?.toString() || "";
      const codeMatch = content.match(
        /<code(?:\s+class="language-([^"]+)")?>([^]*?)<\/code>/
      );

      if (codeMatch) {
        const language = codeMatch[1] || "plaintext"; // Use the captured language or default
        const code = codeMatch[2];

        const highlighted = highlighter.codeToHtml(code, {
          lang: language,
          theme: "css-variables",
        });

        type TRestAsDiv = Omit<ComponentProps<"div">, "className" | "children">;
        return (
          <div
            {...(rest as TRestAsDiv)}
            className={cn(
              "mt-6 w-full text-sm focus-visible:outline-none shiki-div",
              className
            )}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        );
      }

      return (
        <pre {...rest} className={cn("mt-6 w-full", className)}>
          {children}
        </pre>
      );
    },
    strong: ({ children, className, ...rest }) => (
      <span {...rest} className={cn("font-bold", className)}>
        {children}
      </span>
    ),
    figure: ({ children, className, ...rest }) => (
      <figure
        {...rest}
        className={cn(
          "w-[calc(100+1.25rem)] sm:w-full -mx-5 sm:mx-0 transition flex flex-col mt-6",
          className
        )}
      >
        {children}
      </figure>
    ),
    figcaption: ({ children, className, ...rest }) => (
      <figcaption
        {...rest}
        className={cn(
          "px-8 sm:px-5 py-2.5 text-sm text-center text-balance text-muted-foreground w-full leading-snug",
          className
        )}
      >
        {children}
      </figcaption>
    ),
    em: ({ children, className, ...rest }) => (
      <em {...rest} className={cn("italic", className)}>
        {children}
      </em>
    ),
    blockquote: ({ children, className, ...rest }) => (
      <blockquote
        {...rest}
        className={cn(
          "mt-6 bg-background-hover px-3 py-2 w-full rounded-md border-l-4",
          className
        )}
      >
        {children}
      </blockquote>
    ),
    span: ({ children, className, ...rest }) => (
      <span {...rest} className={cn("", className)}>
        {children}
      </span>
    ),
    ...components,
  };
}
