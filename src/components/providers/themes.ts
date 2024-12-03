export const availableThemes = ["dark", "light", "system"] as const;
export const themes = [...availableThemes];
export type TTheme = (typeof availableThemes)[number];
export const defaultTheme: TTheme = "dark";
