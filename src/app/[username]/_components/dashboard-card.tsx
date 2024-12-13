import { CardsIcon } from "@/components/icons/cards-icon";
import { EyeIcon, LockIcon } from "lucide-react";

type Props = {
  href?: string;
  title: string;
  cardCount: number | null;
  isPublic: boolean;
  isOwner: boolean;
  isPending: boolean;
};

export default function DashboardCard({
  title,
  cardCount,
  isPublic,
  isOwner,
  href,
  isPending,
}: Props) {
  const Comp = !isPending && href ? "a" : "div";
  return (
    <Comp
      target="_self"
      href={href}
      data-has-href={!isPending && href !== undefined ? true : undefined}
      data-pending={isPending ? true : undefined}
      className="col-span-12 md:col-span-6 lg:col-span-4 p-1 group/card"
    >
      <div className="border rounded-xl flex gap-16 flex-col items-start justify-start px-5 pt-4 pb-4.5 overflow-hidden not-touch:group-data-[has-href]/card:group-hover/card:bg-background-hover group-data-[has-href]/card:group-active/card:bg-background-hover">
        <div className="w-full flex items-center justify-between gap-4">
          <h2
            className="max-w-full shrink min-w-0 truncate font-bold text-xl leading-none
            group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-foreground group-data-[pending]/card:rounded-md group-data-[pending]/card:animate-skeleton"
          >
            {title}
          </h2>
          {!isPending && isOwner && (
            <div className="size-5 -my-1 shrink-0 text-muted-foreground -mr-0.5">
              {isPublic ? (
                <EyeIcon className="size-full text-warning" />
              ) : (
                <LockIcon className="size-full text-success" />
              )}
            </div>
          )}
        </div>
        {cardCount !== null ? (
          <div className="w-full flex gap-1.5 text-right items-center font-medium justify-end text-muted-foreground text-base">
            {!isPending && <CardsIcon className="size-4 -my-1" />}
            <p
              className="shrink min-w-0 truncate leading-none
              group-data-[pending]/card:text-transparent group-data-[pending]/card:bg-muted-foreground group-data-[pending]/card:rounded group-data-[pending]/card:animate-skeleton"
            >
              {cardCount}
            </p>
          </div>
        ) : (
          <div className="w-full" />
        )}
      </div>
    </Comp>
  );
}
