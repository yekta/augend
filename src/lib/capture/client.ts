import { capture } from "@/components/providers/ph-provider";
import { AppRouterInputs } from "@/server/trpc/api/root";

type TCreateCardInputs = AppRouterInputs["ui"]["createCard"];
type TDeleteCardInputs = AppRouterInputs["ui"]["deleteCards"];
type TCreateDashboardInputs = AppRouterInputs["ui"]["createDashboard"];
type TDeleteDashboardInputs = AppRouterInputs["ui"]["deleteDashboard"];
type TChangeCurrencyPreferenceInputs =
  AppRouterInputs["ui"]["changeCurrencyPreference"];

export function captureCreateCard({
  dashboardSlug,
  cardTypeId,
  values,
  variant,
}: {
  dashboardSlug: TCreateCardInputs["dashboardSlug"];
  cardTypeId: TCreateCardInputs["cardTypeId"];
  values: TCreateCardInputs["values"];
  variant: TCreateCardInputs["variant"];
}) {
  capture("Create Card", {
    "Card Type ID": cardTypeId,
    "Card Variant": variant,
    "Dashboard Slug": dashboardSlug,
    "Card Values": values,
  });
}

export function captureDeleteCards({ ids }: { ids: TDeleteCardInputs["ids"] }) {
  capture("Delete Cards", {
    "Card IDs": ids,
  });
}

export function captureCreateDashboard({
  title,
}: {
  title: TCreateDashboardInputs["title"];
}) {
  capture("Create Dashboard", {
    "Dashboard Title": title,
  });
}

export function captureDeleteDashboard({
  slug,
}: {
  slug: TDeleteDashboardInputs["slug"];
}) {
  capture("Delete Dashboard", {
    "Dashboard Slug": slug,
  });
}

export function captureChangeUsername({
  oldUsername,
  newUsername,
}: {
  oldUsername: string;
  newUsername: string;
}) {
  capture("Change Username", {
    "Old Username": oldUsername,
    "New Username": newUsername,
  });
}

export function captureChangeCurrencyPreference({
  oldPreference,
  newPreference,
}: {
  oldPreference: TChangeCurrencyPreferenceInputs;
  newPreference: TChangeCurrencyPreferenceInputs;
}) {
  capture("Change Currency Preference", {
    "Old Currency Preference": oldPreference,
    "New Currency Preference": newPreference,
  });
}
