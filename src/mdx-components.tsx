import { cn } from "@/lib/utils";
import type { MDXComponents } from "mdx/types";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children, className, ...rest }) => (
      <h1
        {...rest}
        className={cn(
          "text-4xl text-center font-bold mt-12 first-of-type:mt-0",
          className
        )}
      >
        {children}
      </h1>
    ),
    h2: ({ children, className, ...rest }) => (
      <h2
        {...rest}
        className={cn("text-2xl font-bold mt-10 [h1+&]:mt-3", className)}
      >
        {children}
      </h2>
    ),
    h3: ({ children, className, ...rest }) => (
      <h3
        {...rest}
        className={cn(
          "text-xl font-bold mt-8 [h1+&]:mt-3 [h2+&]:mt-3",
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
          "text-lg font-bold mt-6 [h1+&]:mt-3 [h2+&]:mt-3 [h3+&]:mt-3",
          className
        )}
      >
        {children}
      </h4>
    ),
    p: ({ children, className, ...rest }) => (
      <p
        {...rest}
        className={cn("mt-4 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2", className)}
      >
        {children}
      </p>
    ),
    ol: ({ children, className, ...rest }) => (
      <ol
        {...rest}
        className={cn(
          "mt-4 pl-6 list-decimal [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2",
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
          "mt-4 pl-8 list-disc [h1+&]:mt-2 [h2+&]:mt-2 [h3+&]:mt-2 [h4+&]:mt-2",
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
        className={cn("underline not-touch:hover:opacity-80 active:opacity-80")}
      >
        {children}
      </a>
    ),
    ...components,
  };
}
