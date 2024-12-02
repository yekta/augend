import DashboardPage from "@/app/[username]/[dashboard_slug]/_components/dashboard-page";
import { siteTitle } from "@/lib/constants";
import { AppRouterOutputs } from "@/server/trpc/api/root";
import { apiServer } from "@/server/trpc/setup/server";
import { Metadata } from "next";

type Props = {
  params: Promise<{ dashboard_slug: string; username: string }>;
};

const notFoundMeta = {
  title: `Not Found | ${siteTitle}`,
  description: "Not found.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, dashboard_slug } = await params;

  const dashboardObject = await apiServer.ui.getDashboard({
    username,
    dashboardSlug: dashboard_slug,
  });

  if (!dashboardObject) return notFoundMeta;

  return {
    title: `${dashboardObject.data.dashboard.title} | ${dashboardObject.data.user.username} | ${siteTitle}`,
    description: dashboardObject.data.dashboard.title,
  };
}

export default async function Page({ params }: Props) {
  const { dashboard_slug, username } = await params;

  const [cardsInitialData, dashboardInitialData] = await Promise.all([
    apiServer.ui.getCards({ username, dashboardSlug: dashboard_slug }),
    apiServer.ui.getDashboard({ username, dashboardSlug: dashboard_slug }),
  ]);

  let currencyIdsForFetch: string[] = [];
  let currenciesInitialData: AppRouterOutputs["ui"]["getCurrencies"] = [];

  (cardsInitialData || []).forEach((cardObj, index) => {
    if (cardObj.cardType.id === "calculator") {
      const values = cardObj.values;
      if (!values) return;
      values.forEach((v) => {
        if (v.cardTypeInputId !== "calculator_currency_id") return;
        currencyIdsForFetch.push(v.value);
      });
    }
    if (cardObj.cardType.id === "fiat_currency") {
      const values = cardObj.values;
      if (!values) return;
      values.forEach((v) => {
        if (
          v.cardTypeInputId !== "fiat_currency_currency_id_base" &&
          v.cardTypeInputId !== "fiat_currency_currency_id_quote"
        )
          return;
        currencyIdsForFetch.push(v.value);
      });
    }
  });

  if (currencyIdsForFetch.length > 0) {
    [currenciesInitialData] = await Promise.all([
      apiServer.ui.getCurrencies({ ids: currencyIdsForFetch }),
    ]);
  }

  return (
    <DashboardPage
      username={username}
      dashboardSlug={dashboard_slug}
      cardsInitialData={cardsInitialData}
      dashboardInitialData={dashboardInitialData}
      currenciesInitialData={currenciesInitialData}
    />
  );
}
