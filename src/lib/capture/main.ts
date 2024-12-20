import { capture } from "@/components/providers/ph-provider";
import { AppRouterInputs } from "@/server/trpc/api/root";

type TCreateCardInputs = AppRouterInputs["ui"]["createCard"];
type TDeleteCardInputs = AppRouterInputs["ui"]["deleteCards"];
type TCreateDashboardInputs = AppRouterInputs["ui"]["createDashboard"];
type TDeleteDashboardInputs = AppRouterInputs["ui"]["deleteDashboard"];

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
    "App - Card Type ID": cardTypeId,
    "App - Card Variant": variant,
    "App - Dashboard Slug": dashboardSlug,
    "App - Card Values": values,
  });
}

export function captureDeleteCards({ ids }: { ids: TDeleteCardInputs["ids"] }) {
  capture("Delete Cards", {
    "App - Card IDs": ids,
  });
}

export function captureCreateDashboard({
  title,
}: {
  title: TCreateDashboardInputs["title"];
}) {
  capture("Create Dashboard", {
    "App - Dashboard Title": title,
  });
}

export function captureDeleteDashboard({
  slug,
}: {
  slug: TDeleteDashboardInputs["slug"];
}) {
  capture("Delete Dashboard", {
    "App - Dashboard Slug": slug,
  });
}
