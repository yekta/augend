import { Button } from "@/components/ui/button";
import useTransientValue from "@/lib/hooks/use-transient-value";
import { useCopyToClipboard } from "@uidotdev/usehooks";
import { CheckIcon, ClipboardIcon } from "lucide-react";

type Props = {
  textToCopy: string;
};
export default function CopyToClipboardButton({ textToCopy }: Props) {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useTransientValue(false, 1500);
  return (
    <Button
      onClick={() => {
        copyToClipboard(textToCopy);
        setIsCopied(true);
      }}
      size="sm"
      variant="outline"
      className="gap-1.5 py-2 w-40 max-w-full group/button"
      fadeOnDisabled={false}
      data-copied={isCopied ? true : undefined}
    >
      <div className="size-4 shrink-0 transition-transform duration-200 group-data-[copied]/button:rotate-45">
        {isCopied ? (
          <CheckIcon className="size-full -rotate-45" />
        ) : (
          <ClipboardIcon className="size-full" />
        )}
      </div>
      <p className="shrink min-w-0 text-left">
        {isCopied ? "Copied" : "Copy Error"}
      </p>
    </Button>
  );
}
