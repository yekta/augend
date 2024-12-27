import ErrorLine from "@/components/error-line";
import { useDashboardsAuto } from "@/components/providers/dashboards-auto-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { captureDeleteDashboard } from "@/lib/capture/client";
import { api } from "@/server/trpc/setup/react";
import { LoaderIcon } from "lucide-react";
import { FormEvent, useState } from "react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  afterSuccess?: (props: { username: string; slug: string }) => Promise<void>;
  onMutate?: () => void;
  dashboardTitle: string;
  dashboardSlug: string;
};

export default function DeleteDashboardTrigger({
  open,
  onOpenChange,
  afterSuccess,
  onMutate,
  children,
  dashboardTitle,
  dashboardSlug,
}: Props) {
  const { invalidate } = useDashboardsAuto();

  const [inputValue, setInputValue] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    deleteDashboard({ slug: dashboardSlug });
    captureDeleteDashboard({ slug: dashboardSlug });
  }

  const {
    mutate: deleteDashboard,
    isPending: isPendingDeleteDashboard,
    error: errorDeleteDashboard,
  } = api.ui.deleteDashboard.useMutation({
    onMutate: () => {
      onMutate?.();
    },
    onSuccess: async (data) => {
      await Promise.all([afterSuccess?.(data), invalidate()]);
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-destructive">
            Delete dashboard
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            <br />
            Type{" "}
            <span className="bg-foreground/10 px-1 rounded font-bold text-foreground">
              {dashboardTitle}
            </span>{" "}
            below to confirm.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full font-medium"
            placeholder={dashboardTitle}
          />
          {errorDeleteDashboard && (
            <ErrorLine message={errorDeleteDashboard.message} />
          )}
          <div className="flex justify-end flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="border-none text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              state={isPendingDeleteDashboard ? "loading" : "default"}
              data-pending={isPendingDeleteDashboard ? true : undefined}
              variant="destructive"
              className="group/button"
              disabled={inputValue !== dashboardTitle}
            >
              {isPendingDeleteDashboard && (
                <div className="size-6 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <LoaderIcon className="size-full animate-spin" />
                </div>
              )}
              <span className="group-data-[pending]/button:text-transparent">
                Delete
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
