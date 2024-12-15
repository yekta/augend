import { TOnFormSubmitProps } from "@/components/cards/_utils/add-card";
import { TCardValueForAddCards } from "@/server/trpc/api/ui/types";

export type TValueFormProps = {
  onFormSubmit: (props: TOnFormSubmitProps) => void;
  isPendingForm: boolean;
};
