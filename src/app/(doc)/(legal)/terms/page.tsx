import type { Metadata } from "next";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Terms of Service | Augend",
  description: "Terms of service for Augend.",
};

export default function TermsPage() {
  return <Content />;
}
