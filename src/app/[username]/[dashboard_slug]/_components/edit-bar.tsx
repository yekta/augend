import { useDnd } from "@/app/[username]/[dashboard_slug]/_components/dnd-provider";
import { EditButton } from "@/components/edit-button";
import { LoaderIcon } from "lucide-react";

type Props = {};

export function EditBar({}: Props) {
  const { isPendingReorder } = useDnd();
  return (
    <div className="col-span-12 items-center justify-end flex p-1 gap-1">
      <div className="size-5 shrink-0">
        {isPendingReorder && (
          <LoaderIcon className="size-full text-muted-foreground animate-spin" />
        )}
      </div>
      <EditButton />
    </div>
  );
}
