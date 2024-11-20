import { cleanEnvVar } from "@/lib/helpers";
import { TNanoBananoAccount } from "@/trpc/api/routers/nano-banano/types";

export const nanoBananoAccounts: { address: string; isMine: boolean }[] = (
  cleanEnvVar(process.env.NEXT_PUBLIC_ADMIN_NANO_BANANO_CARDS) || ""
)
  .split(",")
  .map((i) => {
    const [address, isMine] = i.split(":");
    return {
      address,
      isMine: isMine === "true",
    };
  });
