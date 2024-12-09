import { z } from "zod";

export const RenameDashboardSchemaUI = z.object({
  title: z
    .string()
    .min(2, {
      message: "Name should be at least 2 characters.",
    })
    .max(32, {
      message: "Name should be at most 32 characters.",
    }),
});

export const CreateDashboardSchemaUI = z.object({
  title: z
    .string()
    .min(2, {
      message: "Name should be at least 2 characters.",
    })
    .max(32, {
      message: "Name should be at most 32 characters.",
    }),
});

export const ChangeUsernameSchemaUI = z.object({
  newUsername: z
    .string()
    .min(3, {
      message: "Username should be at least 3 characters.",
    })
    .max(20, {
      message: "Username should be at most 20 characters.",
    })
    .regex(/^[a-z0-9_]+$/, {
      message:
        "Username can only contain lowercase letters, numbers, and underscores.",
    }),
});
