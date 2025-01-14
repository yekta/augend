import CardInnerWrapper from "@/components/cards/_utils/card-inner-wrapper";
import CardOuterWrapper from "@/components/cards/_utils/card-outer-wrapper";
import CreateCardTrigger from "@/components/cards/_utils/create-card/create-card-trigger";
import { cardTypes } from "@/components/cards/_utils/helpers";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { PlusIcon } from "lucide-react";

type Props = {
  modalId: string;
  dashboardSlug: string;
  xOrderPreference?: "first" | "last";
  shortcutEnabled?: boolean;
  variant: TTriggerVariant;
};

export default function CreateCardButton({
  modalId,
  dashboardSlug,
  xOrderPreference,
  shortcutEnabled,
  variant,
}: Props) {
  return (
    <CreateCardTrigger
      modalId={modalId}
      dashboardSlug={dashboardSlug}
      xOrderPreference={xOrderPreference}
      shortcutEnabled={shortcutEnabled}
    >
      <ButtonWithVariant variant={variant} />
    </CreateCardTrigger>
  );
}

type TTriggerVariant = "icon" | "card";
type ButtonWithVariantProps = {
  variant: TTriggerVariant;
  className?: string;
  [key: string]: any;
};

export function ButtonWithVariant({
  variant,
  className,
  ...rest
}: ButtonWithVariantProps) {
  if (variant === "icon") {
    return (
      <Button {...rest} size="icon" variant="outline" className="size-9">
        <div className="size-5.5 transition data-[editing]:rotate-90">
          <PlusIcon className="size-full" />
        </div>
      </Button>
    );
  }
  return (
    <CardOuterWrapper
      {...rest}
      className={cn(cardTypes.md.className, "h-32", className)}
    >
      <CardInnerWrapper
        className="flex-1 px-6 font-medium py-3 flex flex-row gap-1 items-center text-muted-foreground justify-center 
        not-touch:group-hover/card:bg-background-hover group-active/card:bg-background-hover transition-none duration-0"
      >
        <PlusIcon className="size-5 shrink-0 text-muted-foreground -ml-1" />
        <p className="min-w-0 shrink text-left">Add card</p>
      </CardInnerWrapper>
    </CardOuterWrapper>
  );
}
