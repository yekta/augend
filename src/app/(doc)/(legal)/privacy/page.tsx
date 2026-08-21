import type { Metadata } from "next";
import Content from "./content.mdx";

export const metadata: Metadata = {
  title: "Privacy Policy | Augend",
  description: "Privacy policy for Augend.",
};

export default function PrivacyPage() {
  return <Content />;
}
