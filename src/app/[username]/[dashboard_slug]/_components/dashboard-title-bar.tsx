import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
import { useDndCards } from "@/app/[username]/[dashboard_slug]/_components/dnd-cards-provider";
import EditButtonCards from "@/app/[username]/[dashboard_slug]/_components/edit-button-cards";
import { useEditModeCards } from "@/app/[username]/[dashboard_slug]/_components/edit-mode-cards-provider";
import { AddCardButton } from "@/components/cards/_utils/add-card";
import DeleteDashboardTrigger from "@/components/dashboard/delete-dashboard-trigger";
import ErrorLine from "@/components/error-line";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { mainDashboardSlug } from "@/lib/constants";
import { useAsyncRouterPush } from "@/lib/hooks/use-async-router-push";
import { RenameDashboardSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LoaderIcon,
  PencilIcon,
  TrashIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  isOwner: boolean;
  username: string;
  dashboardSlug: string;
};

export function DashboardTitleBar({ username, dashboardSlug, isOwner }: Props) {
  const [isDialogOpenRenameDashboard, setIsDialogOpenRenameDashboard] =
    useState(false);
  const [isDialogOpenDeleteDashboard, setIsDialogOpenDeleteDashboard] =
    useState(false);

  const renameDashboardForm = useForm<z.infer<typeof RenameDashboardSchemaUI>>({
    resolver: zodResolver(RenameDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const asyncPush = useAsyncRouterPush();
  const { isPendingReorderCards, isErrorReorderCards } = useDndCards();

  const {
    dashboardTitle,
    isPendingDashboard,
    isLoadingErrorDashboard,
    invalidateDashboard,
    cancelDashboardsQuery,
    invalidateDashboards,
  } = useCurrentDashboard();
  const { isEnabled: isEnabledEdit } = useEditModeCards();

  const {
    mutate: renameDashboard,
    isPending: isPendingRenameDashboard,
    error: errorRenameDashboard,
    reset: resetRenameDashboard,
  } = api.ui.renameDashboard.useMutation({
    onMutate: () => {
      cancelDashboardsQuery();
    },
    onSuccess: async (data) => {
      const path = `/${data.username}/${data.slug}`;
      await asyncPush(path);
      await invalidateDashboard();
      setIsDialogOpenRenameDashboard(false);
      renameDashboardForm.reset();
    },
  });

  async function onRenameDashboardFormSubmit(
    values: z.infer<typeof RenameDashboardSchemaUI>
  ) {
    if (dashboardTitle === values.title) {
      setIsDialogOpenRenameDashboard(false);
      resetRenameDashboard();
      renameDashboardForm.reset();
      return;
    }
    renameDashboard({
      title: values.title,
      slug: dashboardSlug,
    });
  }

  return (
    <div
      data-pending={isPendingDashboard ? true : undefined}
      data-loading-error={isLoadingErrorDashboard ? true : undefined}
      className="col-span-12 items-center justify-between flex gap-1.5 px-1 pb-1 md:pb-2 group/titlebar"
    >
      {!isEnabledEdit || !isOwner ? (
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
          <Dialog
            open={isDialogOpenRenameDashboard}
            onOpenChange={setIsDialogOpenRenameDashboard}
          >
            <DialogTrigger
              className="focus:outline-none focus-visible:outline-none focus-visible:ring-foreground/50 focus-visible:ring-offset-2 
              focus-visible:ring-offset-background focus-visible:ring-1 rounded-lg shrink min-w-0 flex"
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
            </DialogTrigger>
            <DialogContent
              classNameInnerWrapper="gap-4"
              className="w-full max-w-[22rem]"
            >
              <DialogHeader>
                <DialogTitle>Rename Dashboard</DialogTitle>
                <DialogDescription>
                  Give a new name to your dashboard.
                </DialogDescription>
              </DialogHeader>
              <Form {...renameDashboardForm}>
                <form
                  onSubmit={renameDashboardForm.handleSubmit(
                    onRenameDashboardFormSubmit
                  )}
                  className="w-full flex flex-col gap-3"
                >
                  <FormField
                    control={renameDashboardForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="w-full sr-only">
                          Dashboard Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoComplete="off"
                            className="w-full"
                            placeholder={dashboardTitle || "New Name"}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    state={isPendingRenameDashboard ? "loading" : "default"}
                    type="submit"
                  >
                    {isPendingRenameDashboard && (
                      <>
                        <p className="text-transparent select-none shrink min-w-0 truncate">
                          Rename
                        </p>
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <LoaderIcon className="size-full animate-spin" />
                        </div>
                      </>
                    )}
                    {!isPendingRenameDashboard && "Rename"}
                  </Button>
                </form>
              </Form>
              {errorRenameDashboard && (
                <ErrorLine message={errorRenameDashboard.message} />
              )}
            </DialogContent>
          </Dialog>
          {/* Delete Dashboard */}
          {dashboardSlug !== mainDashboardSlug && dashboardTitle && (
            <DeleteDashboardTrigger
              dashboardTitle={dashboardTitle}
              dashboardSlug={dashboardSlug}
              open={isDialogOpenDeleteDashboard}
              onOpenChange={setIsDialogOpenDeleteDashboard}
              onMutate={() => cancelDashboardsQuery()}
              afterSuccess={async (data) => {
                const path = `/${data.username}/${mainDashboardSlug}`;
                await asyncPush(path);
                await invalidateDashboards();
              }}
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
            {isPendingReorderCards && (
              <LoaderIcon className="size-5 text-muted-more-foreground animate-spin" />
            )}
            {!isPendingReorderCards && isErrorReorderCards && (
              <TriangleAlertIcon className="size-5 text-destructive" />
            )}
          </div>
          <AddCardButton
            variant="icon"
            username={username}
            dashboardSlug={dashboardSlug}
            xOrderPreference="first"
            shortcutEnabled
          />
          <EditButtonCards />
        </div>
      ) : (
        <div className="size-9 -mr-2 shrink-0" />
      )}
    </div>
  );
}
