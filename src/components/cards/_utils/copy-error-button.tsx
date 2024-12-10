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
      className="gap-1.5 py-2 w-40 max-w-full"
      fadeOnDisabled={false}
      data-copied={isCopied ? true : undefined}
    >
      {isCopied ? (
        <CheckIcon className="size-4 shrink-0" />
      ) : (
        <ClipboardIcon className="size-4 shrink-0" />
      )}
      <p className="shrink min-w-0 text-left">
        {isCopied ? "Copied" : "Copy Error"}
      </p>
    </Button>
  );
}
