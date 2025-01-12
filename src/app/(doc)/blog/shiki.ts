import { cache } from "react";
import {
  BundledLanguage,
  BundledTheme,
  createCssVariablesTheme,
  createHighlighter,
  HighlighterGeneric,
} from "shiki";

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme>;

async function _getHighlighter() {
  if (!highlighter) {
    const augendTheme = createCssVariablesTheme({
      name: "css-variables",
      variablePrefix: "--shiki-",
      variableDefaults: {},
      fontStyle: true,
    });
    highlighter = await createHighlighter({
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
    return highlighter;
  }
  return highlighter;
}

export const getHighlighter = cache(_getHighlighter);
