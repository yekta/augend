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
import { captureDeleteDashboard } from "@/lib/capture/client";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  onSuccess?: (props: { username: string; slug: string }) => Promise<void>;
  onMutate?: () => void;
  dashboardTitle: string;
  dashboardSlug: string;
};

const DeleteDashboardSchemaUI = z.object({
  title: z.string(),
});

export default function DeleteDashboardTrigger({
  open,
  onOpenChange,
  onSuccess,
  onMutate,
  children,
  dashboardTitle,
  dashboardSlug,
}: Props) {
  const { invalidate } = useDashboardsAuto();

  const form = useForm<z.infer<typeof DeleteDashboardSchemaUI>>({
    resolver: zodResolver(DeleteDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const inputValue = form.watch("title");

  function onSubmit(values: z.infer<typeof DeleteDashboardSchemaUI>) {
    deleteDashboard({ slug: dashboardSlug });
    captureDeleteDashboard({ slug: dashboardSlug });
  }

  const {
    mutate: deleteDashboard,
    isPending,
    error,
  } = api.ui.deleteDashboard.useMutation({
    onMutate: () => {
      onMutate?.();
    },
    onSuccess: async (data) => {
      await onSuccess?.(data);
      await invalidate();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-96">
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
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
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
                      placeholder={dashboardTitle}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                state={isPending ? "loading" : "default"}
                data-pending={isPending ? true : undefined}
                variant="destructive"
                className="group/button"
                disabled={inputValue !== dashboardTitle}
              >
                {isPending && (
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
        </Form>
        {error && <ErrorLine message={error.message} />}
      </DialogContent>
    </Dialog>
  );
}
