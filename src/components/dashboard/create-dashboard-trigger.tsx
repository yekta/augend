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
import { captureCreateDashboard } from "@/lib/capture/client";
import { useMainStore } from "@/lib/stores/main/provider";
import { CreateDashboardSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccessEnd?: (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => Promise<void>;
  onSuccess?: (props: {
    dashboardId: string;
    slug: string;
    title: string;
    username: string;
  }) => Promise<void>;
  children: React.ReactNode;
};

export default function CreateDashboardTrigger({
  open,
  onOpenChange,
  onSuccessEnd,
  onSuccess,
  children,
}: Props) {
  const { invalidate } = useDashboardsAuto();

  const form = useForm<z.infer<typeof CreateDashboardSchemaUI>>({
    resolver: zodResolver(CreateDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const addNewDashboardId = useMainStore((s) => s.addNewDashboardId);
  const removeNewDashboardId = useMainStore((s) => s.removeNewDashboardId);

  const setNewDashboardIdTimeout = useRef<NodeJS.Timeout | undefined>();

  const {
    mutate: createDashboard,
    isPending,
    error,
  } = api.ui.createDashboard.useMutation({
    onSuccess: async (d) => {
      await onSuccess?.(d);
      await invalidate();
      onOpenChange(false);
      form.reset();
      await onSuccessEnd?.(d);

      setTimeout(() => {
        clearTimeout(setNewDashboardIdTimeout.current);
        setNewDashboardIdTimeout.current = setTimeout(() => {
          addNewDashboardId({ id: d.dashboardId });
          removeNewDashboardId({ id: d.dashboardId, delay: 2500 });
        }, 200);

        const selector = `[data-card-id="${d.dashboardId}"]`;
        const element = document.querySelector(selector);
        if (!element) return;
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    },
  });

  function onSubmit(values: z.infer<typeof CreateDashboardSchemaUI>) {
    createDashboard({
      title: values.title,
    });
    captureCreateDashboard({ title: values.title });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent classNameInnerWrapper="gap-4" className="w-96">
        <DialogHeader>
          <DialogTitle>Create Dashboard</DialogTitle>
          <DialogDescription>Give a name to your dashboard.</DialogDescription>
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
                    Dashboard Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="off"
                      className="w-full"
                      placeholder="New Dashboard"
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
