import { TCardValueForAddCards } from "@/server/trpc/api/routers/ui/types";

export type TValueFormProps = {
  onFormSubmit: (values: TCardValueForAddCards[]) => void;
  isPendingForm: boolean;
};
