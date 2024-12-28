import { useCurrentDashboard } from "@/app/[username]/[dashboard_slug]/_components/current-dashboard-provider";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAsyncRouterPush } from "@/lib/hooks/use-async-router-push";
import { RenameDashboardSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardTitle: string;
  dashboardSlug: string;
  onMutate?: () => void;
  children: React.ReactNode;
};

export default function RenameDashboardTrigger({
  dashboardSlug,
  dashboardTitle,
  open,
  onOpenChange,
  onMutate,
  children,
}: Props) {
  const { invalidate: invalidateDashboardsAuto } = useDashboardsAuto();
  const { invalidateDashboard: invalidateCurrentDashboard } =
    useCurrentDashboard();

  const form = useForm<z.infer<typeof RenameDashboardSchemaUI>>({
    resolver: zodResolver(RenameDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const asyncPush = useAsyncRouterPush();

  const {
    mutate: renameDashboard,
    isPending,
    error,
    reset,
  } = api.ui.renameDashboard.useMutation({
    onMutate: () => {
      onMutate?.();
    },
    onSuccess: async (data) => {
      const path = `/${data.username}/${data.slug}`;
      await asyncPush(path);
      await Promise.all([
        invalidateCurrentDashboard(),
        invalidateDashboardsAuto(),
      ]);
      onOpenChange(false);
      form.reset();
    },
  });

  async function onSubmit(values: z.infer<typeof RenameDashboardSchemaUI>) {
    if (dashboardTitle === values.title) {
      onOpenChange(false);
      reset();
      form.reset();
      return;
    }
    renameDashboard({
      title: values.title,
      slug: dashboardSlug,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent classNameInnerWrapper="gap-4" className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>Rename Dashboard</DialogTitle>
          <DialogDescription>
            Give a new name to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col gap-3"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="w-full sr-only">
                    Rename Dashboard
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      className="w-full"
                      placeholder={dashboardTitle}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button state={isPending ? "loading" : "default"} type="submit">
              {isPending && (
                <>
                  <p className="text-transparent select-none shrink min-w-0 truncate">
                    Create
                  </p>
                  <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <LoaderIcon className="size-full animate-spin" />
                  </div>
                </>
              )}
              {!isPending && "Create"}
            </Button>
          </form>
        </Form>
        {error && <ErrorLine message={error.message} />}
      </DialogContent>
    </Dialog>
  );
}
