import { Button } from "@/components/ui/button";
import { sc } from "@/lib/constants";
import { CheckIcon, MinusIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type Props = {};

type TFeature = {
  text: string | ReactNode;
  noTick?: boolean;
};
type TPlan = {
  title: string;
  stripePriceId?: string;
  features: TFeature[];
  price: {
    monthly: number;
    yearly: number;
  };
};

const plans: TPlan[] = [
  {
    title: "Free",
    features: [
      {
        text: (
          <>
            <span className="font-bold">20</span> cards.
          </>
        ),
        noTick: true,
      },
      {
        text: (
          <>
            Data update frequency: <span className="font-bold">2 minutes</span>.
          </>
        ),
        noTick: true,
      },
    ],
    price: {
      monthly: 0,
      yearly: 0,
    },
  },
  {
    title: "Starter",
    stripePriceId: "price_1J2JZzLZQYF5tJjO6Wz9s5Z6",
    features: [
      {
        text: (
          <>
            <span className="font-bold">100</span> cards.
          </>
        ),
      },
      {
        text: (
          <>
            Data update frequency: <span className="font-bold">10 seconds</span>
            .
          </>
        ),
      },
    ],
    price: {
      monthly: 15,
      yearly: 10,
    },
  },
  {
    title: "Pro",
    stripePriceId: "price_1J2JZzLZQYF5tJjO6Wz9s5Z6",
    features: [
      {
        text: (
          <>
            <span className="font-bold">Unlimited</span> cards.
          </>
        ),
      },
      {
        text: (
          <>
            Data update frequency: <span className="font-bold">10 seconds</span>
            .
          </>
        ),
      },
    ],
    price: {
      monthly: 40,
      yearly: 30,
    },
  },
];

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
        >
          Discord
        </Link>{" "}
        to ask us anything. We are happy to help. You can also reach out via{" "}
        <Link
          className="underline not-touch:hover:text-foreground active:text-foreground"
          href={sc.x.siteHref}
        >
          X/Twitter
        </Link>{" "}
        or{" "}
        <Link
          className="underline not-touch:hover:text-foreground active:text-foreground"
          href={sc.email}
        >
          email
        </Link>
        .
      </>
    ),
  },
];

export default function Page({}: Props) {
  return (
    <div className="w-full flex flex-col flex-1 items-center">
      <div className="w-full flex flex-col items-center max-w-7xl px-4 md:px-8 pt-2 md:pt-4 pb-12 gap-6">
        {/* Title section */}
        <div className="w-full max-w-sm flex flex-col items-center">
          <h1 className="w-full text-center text-4xl font-bold leading-tight px-2">
            Plans
          </h1>
          <p className="w-full text-center text-muted-foreground">
            Choose a plan that works for you.
          </p>
        </div>
        {/* Plan Cards */}
        <div className="w-full flex flex-wrap flex-row items-stretch justify-center gap-3">
          {plans.map((plan) => {
            return (
              <div
                key={plan.title}
                className="w-full max-w-sm border rounded-xl flex flex-col min-w-0"
              >
                <div className="w-full flex flex-col gap-2.5 px-6 pt-4.5 pb-5">
                  {/* Plan name */}
                  <h2 className="w-full leading-tight font-semibold text-xl">
                    {plan.title}
                  </h2>
                  {/* Price */}
                  <div className="w-full flex flex-col gap-1">
                    <p className="w-full leading-tight text-3xl font-bold">
                      <span>${plan.price.monthly}</span>
                      <span className="text-muted-foreground text-base font-medium">
                        /month
                      </span>
                    </p>
                    <p className="text-base font-medium leading-tight">
                      {plan.price.monthly !== 0 ? "Billed monthly" : "No bill"}
                    </p>
                  </div>
                </div>
                <div className="w-full flex px-5">
                  <Button className="w-full">Subscribe</Button>
                </div>
                {/* Features */}
                <div className="w-full flex flex-col px-6 pt-5 pb-5.5 gap-3 flex-1">
                  {plan.features.map((feature, id) => (
                    <div className="w-full flex gap-2" key={id}>
                      <div className="size-4 shrink-0 mt-0.5">
                        {feature.noTick ? (
                          <MinusIcon className="size-full text-muted-foreground" />
                        ) : (
                          <CheckIcon className="size-full text-success" />
                        )}
                      </div>
                      <p className="min-w-0 shrink leading-tight">
                        {feature.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-full flex flex-row flex-wrap self-start justify-center border-t border-b pt-5 pb-5.5 mt-3">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="w-full md:w-1/3 flex flex-col min-w-0 px-4 py-3 gap-1.5"
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
