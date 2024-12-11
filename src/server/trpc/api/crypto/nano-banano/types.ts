import { z } from "zod";

export const AccountSchema = z.object({
  address: z.string(),
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
};

export type TNanoBananoHistoryResult = {
  account: string;
  history: {
    type: "send" | "receive" | "change";
    account: string;
    amount: string;
    hash: string;
    height: string;
    local_timestamp: string;
  }[];
  previous?: string;
};

export type TNanoBananoHistoryResultEdited = {
  account: string;
  history: {
    type: "send" | "receive" | "change";
    address: string;
    amount_decimal: number;
    timestamp: number;
  }[];
  previous?: string;
};
