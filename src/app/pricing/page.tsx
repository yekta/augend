import PlanCardsSection from "@/app/pricing/_components/cards-section";
import { sc } from "@/lib/constants";
import Link from "next/link";
import { ReactNode, Suspense } from "react";

type Props = {};

export default async function Page({}: Props) {
  return (
    <div className="w-full flex flex-col flex-1 items-center justify-center pt-2 pb-[calc(8vh+2rem)]">
      <div className="w-full flex flex-col items-center max-w-7xl px-4 md:px-8">
        {/* Title section */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <h1 className="w-full text-center text-4xl font-bold leading-tight px-2">
            Plans
          </h1>
          <p className="w-full text-center text-muted-foreground">
            Choose a plan that works for you.
          </p>
        </div>
        {/* Cards section */}
        <Suspense>
          <PlanCardsSection />
        </Suspense>
        {/* FAQ section */}
        <div className="mt-9 w-full flex flex-row flex-wrap justify-start border-t border-b pt-4 pb-5.5">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="w-full md:w-1/2 lg:w-1/3 flex flex-col min-w-0 px-4 py-4 gap-1.5"
            >
              <h3 className="w-full font-semibold leading-tight">
                {faq.question}
              </h3>
              <p className="w-full text-muted-foreground">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type TFaq = {
  question: string;
  answer: string | ReactNode;
};

const faqs: TFaq[] = [
  {
    question: "Can I cancel my plan anytime?",
    answer:
      "Yes, you can cancel your plan anytime and billing will stop at the end of that billing cycle.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can upgrade or downgrade your plan anytime. The changes will take effect immediately.",
  },
  {
    question: "Where can I ask more questions?",
    answer: (
      <>
        You can join our{" "}
        <Link
          className="underline not-touch:hover:text-foreground active:text-foreground"
          href={sc.discord.siteHref}
          target="_blank"
        >
          Discord
        </Link>{" "}
        to ask us anything. We are happy to help. You can also reach out via{" "}
        <Link
          className="underline not-touch:hover:text-foreground active:text-foreground"
          href={sc.x.siteHref}
          target="_blank"
        >
          X/Twitter
        </Link>{" "}
        or{" "}
        <Link
          className="underline not-touch:hover:text-foreground active:text-foreground"
          href={sc.email.siteHref}
          target="_blank"
        >
          email
        </Link>
        .
      </>
    ),
  },
];
