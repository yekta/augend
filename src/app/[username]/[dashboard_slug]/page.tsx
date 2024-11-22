import Dashboard from "@/app/[username]/_components/dashboard";
import { TValuesEntry } from "@/components/cards/utils/card-parser";
import { siteTitle } from "@/lib/constants";
import { AppRouterOutputs } from "@/trpc/api/root";
import { apiServer } from "@/trpc/setup/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ dashboard_slug: string; username: string }>;
};

const notFoundMeta = {
  title: `Not Found | ${siteTitle}`,
  description: "Not found.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const start = Date.now();
  const { username, dashboard_slug } = await params;

  const dashboardObject = await apiServer.ui.getDashboard({
    username,
    dashboardSlug: dashboard_slug,
  });

  if (!dashboardObject) return notFoundMeta;

  console.log(
    `[username]/[dashboard_slug]:generateMetadata | Total | ${
      Date.now() - start
    }ms`
  );

  return {
    title: `${dashboardObject.dashboard.title} | ${dashboardObject.user.username} | ${siteTitle}`,
    description: dashboardObject.dashboard.title,
  };
}

export default async function Page({ params }: Props) {
  const start = Date.now();
  const { dashboard_slug, username } = await params;

  const [cardsInitialData, dashboardInitialData] = await Promise.all([
    apiServer.ui.getCards({ username, dashboardSlug: dashboard_slug }),
    apiServer.ui.getDashboard({ username, dashboardSlug: dashboard_slug }),
  ]);

  let currencyIdsForFetch: string[] = [];
  let currenciesInitialData: AppRouterOutputs["ui"]["getCurrencies"] = [];

  (cardsInitialData || []).forEach((cardObj, index) => {
    if (cardObj.card.cardTypeId === "calculator") {
      const values = cardObj.card.values as TValuesEntry[];
      if (!values) return;
      values.forEach((v) => {
        if (v.id !== "currency_id") return;
        currencyIdsForFetch.push(v.value);
      });
    }
    if (cardObj.card.cardTypeId === "fiat_currency") {
      const values = cardObj.card.values as TValuesEntry[];
      if (!values) return;
      values.forEach((v) => {
        if (v.id !== "base_id" && v.id !== "quote_id") return;
        currencyIdsForFetch.push(v.value);
      });
    }
  });

  if (currencyIdsForFetch.length > 0) {
    [currenciesInitialData] = await Promise.all([
      apiServer.ui.getCurrencies({ ids: currencyIdsForFetch }),
    ]);
  }

  console.log(`[username]/[dashboard_slug] | Total | ${Date.now() - start}ms`);

  return (
    <Dashboard
      username={username}
      dashboardSlug={dashboard_slug}
      cardsInitialData={cardsInitialData}
      dashboardInitialData={dashboardInitialData}
      currenciesInitialData={currenciesInitialData}
    />
  );
}
