import { z } from "zod";

export const AccountSchema = z.object({
  address: z.string(),
  isMine: z.boolean(),
});

export type TNanoBananoAccount = z.infer<typeof AccountSchema>;

export type TNanoBananoBalanceResponse = {
  balances: {
    [key: string]: {
      balance: string;
      pending: string;
      receivable: string;
    };
  };
  errors?: {
    [key: string]: string;
  };
};

export type TNanoBananoResult = {
  address: string;
  balance: number;
  pending: number;
  receivable: number;
  isMine: boolean;
};
