import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { useDndCards } from "@/app/[username]/[dashboard_slug]/_components/dnd-cards-provider";
import EditButtonCards from "@/app/[username]/[dashboard_slug]/_components/edit-button-cards";
import { useEditModeCards } from "@/app/[username]/[dashboard_slug]/_components/edit-mode-cards-provider";
import CreateCardButton from "@/components/cards/_utils/create-card/create-card-button";
import DeleteDashboardTrigger from "@/components/dashboard/delete-dashboard-trigger";
import RenameDashboardTrigger from "@/components/dashboard/rename-dashboard-trigger";
import { Button } from "@/components/ui/button";
import { mainDashboardSlug } from "@/lib/constants";
import { useAsyncRouterPush } from "@/lib/hooks/use-async-router-push";
import { api } from "@/server/trpc/setup/react";
import {
  LoaderIcon,
  PencilIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect } from "react";

type Props = {
  isOwner: boolean;
  dashboardSlug: string;
};

const renameDashboardModalId = "rename_dashboard";
const deleteDashboardModalId = "delete_dashboard";

export function DashboardTitleBar({ dashboardSlug, isOwner }: Props) {
  const [currentModalId, setCurrentModalId] = useQueryState("modal");
  const { isEnabled } = useEditModeCards();
  const utils = api.useUtils();

  useEffect(() => {
    if (isEnabled) return;
    if (
      currentModalId === renameDashboardModalId ||
      currentModalId === deleteDashboardModalId ||
      (currentModalId === deleteDashboardModalId &&
        dashboardSlug === mainDashboardSlug)
    ) {
      setCurrentModalId(null);
    }
  }, [isEnabled]);

  const isDialogOpenRenameDashboard = currentModalId === renameDashboardModalId;
  const setIsDialogOpenRenameDashboard = (o: boolean) => {
    if (o) {
      setCurrentModalId(renameDashboardModalId);
      return;
    }
    setCurrentModalId(null);
  };

  const isDialogOpenDeleteDashboard = currentModalId === deleteDashboardModalId;
  const setIsDialogOpenDeleteDashboard = (o: boolean) => {
    if (o) {
      setCurrentModalId(deleteDashboardModalId);
      return;
    }
    setCurrentModalId(null);
  };

  const asyncPush = useAsyncRouterPush();
  const onSuccessDeleteDashboard = async (data: {
    username: string;
    slug: string;
  }) => {
    const path = `/${data.username}/${mainDashboardSlug}`;
    await asyncPush(path);
  };

  const { isPendingReorderCards, isErrorReorderCards } = useDndCards();

  const {
    dashboardTitle,
    isPendingDashboard,
    isLoadingErrorDashboard,
    cancelDashboardsQuery,
  } = useCurrentDashboard();

  const { isEnabled: isEnabledCardEdit, canEdit: canEditCards } =
    useEditModeCards();

  const { isPending: isPendingDeleteCards } = api.ui.deleteCards.useMutation();

  const isPendingAny = isPendingDeleteCards || isPendingReorderCards;
  const isHardErrorAny = !isPendingReorderCards && isErrorReorderCards;

  return (
    <div
      data-pending={isPendingDashboard ? true : undefined}
      data-loading-error={isLoadingErrorDashboard ? true : undefined}
      className="col-span-12 items-center justify-between flex gap-1.5 px-1 pb-1 md:pb-2 group/titlebar"
    >
      {!isEnabledCardEdit || !canEditCards || !dashboardTitle ? (
        <h1
          className="border border-transparent px-2 py-1.75 md:py-0.5 rounded-lg font-bold text-xl md:text-2xl leading-none md:leading-none truncate shrink
          group-data-[pending]/titlebar:text-transparent group-data-[pending]/titlebar:rounded-md group-data-[pending]/titlebar:bg-foreground group-data-[pending]/titlebar:animate-skeleton"
        >
          {isPendingDashboard
            ? "Loading"
            : isLoadingErrorDashboard
            ? "Error"
            : dashboardTitle}
        </h1>
      ) : (
        <div className="flex justify-start items-center shrink min-w-0 gap-1.5">
          {/* Rename Dashboard */}
          <RenameDashboardTrigger
            open={isDialogOpenRenameDashboard}
            onOpenChange={setIsDialogOpenRenameDashboard}
            dashboardSlug={dashboardSlug}
            dashboardTitle={dashboardTitle}
            onMutate={cancelDashboardsQuery}
          >
            <div
              className="flex shrink min-w-0 rounded-lg items-center justify-start gap-2 
                border not-touch:hover:bg-border active:bg-border px-2 py-1.75 md:py-1.25 overflow-hidden"
            >
              <h1
                className="font-bold text-xl md:text-2xl leading-none md:leading-none truncate shrink min-w-0
                  group-data-[pending]/titlebar:text-transparent group-data-[pending]/titlebar:rounded-md group-data-[pending]/titlebar:bg-foreground group-data-[pending]/titlebar:animate-skeleton
                  py-1 -my-1"
              >
                {isPendingDashboard
                  ? "Loading"
                  : isLoadingErrorDashboard
                  ? "Error"
                  : dashboardTitle}
              </h1>
              <PencilIcon className="size-4 md:size-4.5 -my-1 shrink-0" />
            </div>
          </RenameDashboardTrigger>
          {/* Delete Dashboard */}
          {dashboardSlug !== mainDashboardSlug && dashboardTitle && (
            <DeleteDashboardTrigger
              dashboardTitle={dashboardTitle}
              dashboardSlug={dashboardSlug}
              open={isDialogOpenDeleteDashboard}
              onOpenChange={setIsDialogOpenDeleteDashboard}
              onMutate={() => cancelDashboardsQuery()}
              onSuccess={onSuccessDeleteDashboard}
            >
              <Button
                size="icon"
                variant="outline"
                className="size-9 shrink-0 text-destructive not-touch:hover:bg-destructive not-touch:hover:text-destructive-foreground
                active:bg-destructive active:text-destructive-foreground"
              >
                <div className="size-4.5">
                  <TrashIcon className="size-full" />
                </div>
              </Button>
            </DeleteDashboardTrigger>
          )}
        </div>
      )}
      {isOwner ? (
        <div className="flex items-center justify-start shrink-0 gap-1.5">
          <div className="size-7 flex items-center justify-center">
            {isPendingAny && (
              <LoaderIcon className="size-5 text-muted-more-foreground animate-spin" />
            )}
            {isHardErrorAny && (
              <TriangleAlertIcon className="size-5 text-destructive" />
            )}
          </div>
          <CreateCardButton
            modalId="create_card_from_title_bar"
            variant="icon"
            dashboardSlug={dashboardSlug}
            xOrderPreference="first"
            shortcutEnabled
          />
          {canEditCards && <EditButtonCards />}
        </div>
      ) : (
        <div className="size-9 -mr-2 shrink-0" />
      )}
    </div>
  );
}
