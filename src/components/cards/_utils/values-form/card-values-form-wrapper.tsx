import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};
export default function CardValuesFormWrapper({
  children,
  onSubmit,
  className,
}: Props) {
  return (
    <div className={cn("w-full flex flex-col", className)}>
      <form onSubmit={onSubmit} className="w-full flex flex-col gap-4 pt-0.5">
        {children}
      </form>
    </div>
  );
}
