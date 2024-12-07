import { TCardValueForAddCards } from "@/server/trpc/api/ui/types";

export type TValueFormProps = {
  onFormSubmit: (values: TCardValueForAddCards[]) => void;
  isPendingForm: boolean;
};
