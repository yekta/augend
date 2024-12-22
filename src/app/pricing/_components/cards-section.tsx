"use client";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, MinusIcon } from "lucide-react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { ReactNode } from "react";
import { z } from "zod";

const BillingCycleEnum = z.enum(["yearly", "monthly"]);
type TBillingCycle = z.infer<typeof BillingCycleEnum>;

const billingCycleDefault: TBillingCycle = "yearly";

const billingCycleObjects: Record<
  TBillingCycle,
  { title: string; description: string | ReactNode }
> = {
  monthly: { title: "Monthly", description: "Billed monthly" },
  yearly: {
    title: "Yearly",
    description: "Billed yearly (20% off)",
  },
};

type Props = {};

export default function PlanCardsSection({}: Props) {
  const [billingCycle, setBillingCycle] = useQueryState(
    "cycle",
    parseAsStringEnum(BillingCycleEnum.options).withDefault(billingCycleDefault)
  );

  return (
    <>
      <div className="w-full flex flex-col items-center mt-6">
        <RadioGroup
          defaultValue={billingCycle}
          onValueChange={(v) => setBillingCycle(v as TBillingCycle)}
          className="w-full max-w-md md:w-auto md:max-w-full min-w-0 flex flex-row gap-0 bg-border rounded-lg p-0.75"
        >
          {BillingCycleEnum.options.map((value) => (
            <div key={value} className="flex-1 min-w-0 flex flex-row">
              <RadioGroupItem
                id={value}
                value={value}
                className="size-0 overflow-hidden border-0 p-0 m-0 active:border-0 active:p-0 data-[state=checked]:border-0 peer
                  ring-0 focus-visible:ring-0 focus:ring-0"
              />
              <label
                htmlFor={value}
                className="flex-1 w-36 text-center min-w-0 truncate px-3 py-1.75 rounded-md font-semibold
                peer-data-[state=checked]:bg-background cursor-pointer peer-focus-visible:ring-1 peer-focus-visible:ring-foreground/50"
              >
                {billingCycleObjects[value].title}
              </label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="mt-4 w-full flex flex-wrap flex-row items-stretch justify-center gap-4">
        {plans.map((plan) => {
          return (
            <div
              key={plan.title}
              className="w-full max-w-md md:max-w-[23rem] border rounded-xl flex flex-col min-w-0"
            >
              <div className="w-full flex flex-col px-6 pt-4.5 pb-5">
                {/* Plan name */}
                <h2 className="w-full leading-tight font-semibold text-xl">
                  {plan.title}
                </h2>
                {/* Price */}
                <div className="mt-3 w-full flex flex-col">
                  <p className="w-full leading-none text-3xl font-bold">
                    {billingCycle === "yearly" && plan.price && (
                      <>
                        <span className="font-medium leading-none text-muted-foreground line-through">
                          ${plan.price.monthly}
                        </span>{" "}
                      </>
                    )}
                    <span>${plan.price?.[billingCycle] || 0}</span>
                    <span className="text-muted-foreground text-base font-medium leading-none">
                      /month
                    </span>
                  </p>
                  <p className="mt-1.5 text-base font-medium leading-tight">
                    {plan.price
                      ? billingCycleObjects[billingCycle].description
                      : "No billing"}
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
                    <div className="size-4 shrink-0 mt-0.5 -ml-0.25">
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
    </>
  );
}

type TFeature = {
  text: string | ReactNode;
  noTick?: boolean;
};
type TPlan = {
  title: string;
  stripePriceId?: string;
  features: TFeature[];
  price?: Record<TBillingCycle, number>;
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
      {
        text: "No access to members-only channels.",
        noTick: true,
      },
    ],
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
      { text: "Access to members-only channels." },
    ],
    price: {
      monthly: 15,
      yearly: 12,
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
      {
        text: "Access to members-only channels.",
      },
    ],
    price: {
      monthly: 40,
      yearly: 32,
    },
  },
];
