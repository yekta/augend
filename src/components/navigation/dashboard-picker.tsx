"use client";

import { ErrorLine } from "@/components/error-line";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { api } from "@/server/trpc/setup/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckIcon, ChevronDownIcon, LoaderIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type Props = {};

export function DashboardPicker({}: Props) {
  const pathname = usePathname();
  const arr = pathname.split("/");
  const username = arr.length > 1 ? pathname.split("/")[1] : undefined;
  const dashboardSlug = arr.length > 2 ? pathname.split("/")[2] : undefined;
  const isDashboardPath = pathname.split("/").length >= 3;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);

  const utils = api.useUtils();
  const { data, isPending, isLoadingError } = api.ui.getDashboards.useQuery(
    {
      username: username!,
    },
    {
      enabled: isDashboardPath,
    }
  );

  const [selectedDashboard, setSelectedDashboard] = useState(
    data?.dashboards && data.dashboards.length > 0
      ? {
          title: data.dashboards[0].dashboard.title,
          slug: data.dashboards[0].dashboard.slug,
        }
      : null
  );

  const onDashboardCreated = (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => {
    setIsDropdownOpen(false);
    setSelectedDashboard({
      title: dashboard.title,
      slug: dashboard.slug,
    });
    utils.ui.getDashboards.invalidate({ username });
  };

  useEffect(() => {
    if (!data) return;
    const dashboard = data.dashboards.find(
      (d) => d.dashboard.slug === dashboardSlug
    );
    if (!dashboard) return;
    setSelectedDashboard({
      title: dashboard.dashboard.title,
      slug: dashboard.dashboard.slug,
    });
  }, [data, pathname]);

  const isHardError = !isPending && isLoadingError && !data;

  return (
    isDashboardPath &&
    username &&
    dashboardSlug && (
      <>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="font-semibold w-36 md:w-44 text-left justify-between items-center gap-1 group/trigger px-2.5 py-2.5"
              data-pending={isPending ? true : undefined}
              data-loading-error={isHardError ? true : undefined}
              disabled={isPending || isHardError || data === null}
            >
              <p
                className="truncate pointer-events-none select-none group-data-[pending]/trigger:text-transparent group-data-[pending]/trigger:bg-foreground 
                  group-data-[pending]/trigger:rounded group-data-[pending]/trigger:animate-skeleton group-data-[loading-error]/trigger:text-destructive leading-none"
              >
                {isHardError
                  ? "Error"
                  : data === null || (data && selectedDashboard === null)
                  ? "Not found"
                  : selectedDashboard?.title || "Loading"}
              </p>
              {data !== null && !isHardError && (
                <ChevronDownIcon className="size-4 pointer-events-none select-none -my-1 -mr-1 shrink-0 text-muted-more-foreground group-data-[state=open]/trigger:rotate-180 transition-transform" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[var(--radix-popper-anchor-width)] p-0 flex flex-col max-h-[min(calc((100vh-4rem)*0.7),20rem)] shadow-xl shadow-shadow/[var(--opacity-shadow)]"
          >
            {data && (
              <>
                {data.isOwner && (
                  <>
                    {/* Create Dashboard Button */}
                    <DropdownMenuGroup className="p-1">
                      <AddCardButton
                        onDashboardCreated={onDashboardCreated}
                        username={username}
                        open={isCreateDashboardOpen}
                        onOpenChange={setIsCreateDashboardOpen}
                      />
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator className="py-0 my-0" />
                  </>
                )}
                <DropdownMenuGroup className="overflow-auto shrink min-w-0 p-1">
                  {data.dashboards.map((d) => (
                    <DropdownMenuItem
                      key={d.dashboard.slug}
                      asChild
                      className="cursor-pointer font-semibold group/item"
                      data-item-selected={
                        d.dashboard.slug === selectedDashboard?.slug
                          ? true
                          : undefined
                      }
                    >
                      <Link
                        onClick={() =>
                          setSelectedDashboard({
                            title: d.dashboard.title,
                            slug: d.dashboard.slug,
                          })
                        }
                        href={`/${username}/${d.dashboard.slug}`}
                        className="flex items-center justify-between"
                      >
                        <p className="min-w-0 shrink leading-tight">
                          {d.dashboard.title}
                        </p>
                        <CheckIcon
                          className="size-3.5 pointer-events-none select-none -my-1 -mr-0.5 shrink-0 text-foreground opacity-0 scale-0
                          group-data-[item-selected]/item:opacity-100 group-data-[item-selected]/item:scale-100 transition"
                        />
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  );
}

const CreateCardFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: "Should be at least 2 characters.",
    })
    .max(32, {
      message: "Should be at most 32 characters.",
    }),
});

function AddCardButton({
  username,
  open,
  onOpenChange,
  onDashboardCreated,
}: {
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDashboardCreated?: (dashboard: {
    slug: string;
    title: string;
    dashboardId: string;
  }) => void;
}) {
  const form = useForm<z.infer<typeof CreateCardFormSchema>>({
    resolver: zodResolver(CreateCardFormSchema),
    defaultValues: {
      title: "",
    },
  });
  const asyncRouterPush = useAsyncRouterPush();
  const {
    mutate: createDashboard,
    isPending,
    error,
    isError,
  } = api.ui.createDashboard.useMutation({
    onSuccess: async (d) => {
      await asyncRouterPush(`/${username}/${d.slug}`);
      onOpenChange(false);
      onDashboardCreated?.(d);
    },
  });
  function onSubmit(values: z.infer<typeof CreateCardFormSchema>) {
    createDashboard({
      title: values.title,
    });
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="w-full justify-start text-left items-center gap-1 px-1.5"
        >
          <PlusIcon className="size-4" />
          <p className="shrink min-w-0 truncate">Create</p>
        </Button>
      </DialogTrigger>
      <DialogContent
        classNameInnerWrapper="gap-4"
        className="w-full max-w-[22rem]"
      >
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
                <FormItem className="w-full flex flex-col gap-2">
                  <FormLabel className="w-full sr-only">
                    Dashboard Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="w-full"
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
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
