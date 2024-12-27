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
import { newDashboardIdsAtom } from "@/lib/stores/main";
import { CreateDashboardSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDashboardCreated?: (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => Promise<void>;
  afterSuccess?: (props: {
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
  onDashboardCreated,
  afterSuccess,
  children,
}: Props) {
  const { invalidate } = useDashboardsAuto();

  const form = useForm<z.infer<typeof CreateDashboardSchemaUI>>({
    resolver: zodResolver(CreateDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const setNewDashboardIds = useSetAtom(newDashboardIdsAtom);
  const setNewDashboardIdTimeout = useRef<NodeJS.Timeout | undefined>();
  const newDashboardIdTimeout = useRef<NodeJS.Timeout | undefined>();

  const {
    mutate: createDashboard,
    isPending,
    error,
  } = api.ui.createDashboard.useMutation({
    onSuccess: async (d) => {
      await Promise.all([afterSuccess?.(d), invalidate()]);
      onOpenChange(false);
      form.reset();
      await onDashboardCreated?.(d);

      setTimeout(() => {
        clearTimeout(setNewDashboardIdTimeout.current);
        setNewDashboardIdTimeout.current = setTimeout(() => {
          setNewDashboardIds((prev) => ({ ...prev, [d.dashboardId]: true }));
          clearTimeout(newDashboardIdTimeout.current);
          newDashboardIdTimeout.current = setTimeout(() => {
            setNewDashboardIds((prev) => {
              const { [d.dashboardId]: _, ...rest } = prev;
              return rest;
            });
          }, 2500);
          d;
        }, 300);

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
      <DialogContent classNameInnerWrapper="gap-4" className="w-full max-w-sm">
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
