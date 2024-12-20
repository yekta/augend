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
import { captureCreateDashboard } from "@/lib/capture/main";
import { CreateDashboardSchemaUI } from "@/server/trpc/api/ui/types";
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDashboardCreated?: (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => void;
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
  const form = useForm<z.infer<typeof CreateDashboardSchemaUI>>({
    resolver: zodResolver(CreateDashboardSchemaUI),
    defaultValues: {
      title: "",
    },
  });

  const {
    mutate: createDashboard,
    isPending,
    error,
  } = api.ui.createDashboard.useMutation({
    onSuccess: async (d) => {
      await afterSuccess?.(d);
      onOpenChange(false);
      form.reset();
      onDashboardCreated?.(d);
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
