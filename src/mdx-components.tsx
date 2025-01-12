import ImageWithZoom from "@/components/doc/image-with-zoom";
import { cn } from "@/lib/utils";
import type { MDXComponents } from "mdx/types";
import { createCssVariablesTheme, createHighlighter } from "shiki";

const augendTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});

const highlighter = await createHighlighter({
  langs: [
    "javascript",
    "typescript",
    "html",
    "css",
    "json",
    "bash",
    "shell",
    "markdown",
    "tsx",
    "jsx",
  ],
  themes: [augendTheme],
});

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, className, ...rest }) => (
      <h1
        {...rest}
        className={cn(
          "text-4xl text-foreground text-balance text-center font-bold mt-14 first-of-type:mt-0 leading-tight",
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
          "text-3xl text-foreground text-balance font-bold mt-12 [h1+&]:mt-3 leading-tight",
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
          "text-2xl text-foreground text-balance font-bold mt-10 [h1+&]:mt-3 [h2+&]:mt-3 leading-snug",
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
          "text-xl text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3 leading-snug",
          className
        )}
      >
        {children}
      </h4>
    ),
    h5: ({ children, className, ...rest }) => (
      <h4
        {...rest}
        className={cn(
          "text-lg text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3 [h4+&]:mt-3 leading-snug",
          className
        )}
      >
        {children}
      </h4>
    ),
    h6: ({ children, className, ...rest }) => (
      <h4
        {...rest}
        className={cn(
          "text-base text-foreground text-balance font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3 [h4+&]:mt-3 [h5+&]:mt-3 leading-snug",
          className
        )}
      >
        {children}
      </h4>
    ),
    p: ({ children, className, ...rest }) => (
      <p
        {...rest}
        className={cn(
          "mt-4 w-full leading-relaxed [blockquote+&]:mt-6 [figure+&]:mt-8 [pre+&]:mt-6 [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2 [h5+&]:mt-2 [h6+&]:mt-2 [blockquote>&]:mt-0 [blockquote>&]:italic",
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
          "underline not-touch:hover:opacity-80 active:opacity-80 focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm"
        )}
      >
        {children}
      </a>
    ),
    img: (props) => <ImageWithZoom {...props} />,
    pre: async ({ children, className, ...rest }) => {
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

        return (
          <pre
            {...rest}
            className={cn(
              "mt-6 w-full text-sm focus-visible:outline-none",
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
        className={cn("w-full transition flex flex-col mt-8", className)}
      >
        {children}
      </figure>
    ),
    figcaption: ({ children, className, ...rest }) => (
      <figcaption
        {...rest}
        className={cn(
          "px-4 py-2.5 text-sm text-center text-balance text-muted-foreground w-full leading-snug",
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
