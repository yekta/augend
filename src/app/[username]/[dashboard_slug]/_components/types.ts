import { z } from "zod";

export const RenameDashboardSchemaUI = z.object({
  title: z
    .string()
    .min(2, {
      message: "Should be at least 2 characters.",
    })
    .max(32, {
      message: "Should be at most 32 characters.",
    }),
});
