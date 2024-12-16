import { TCardTypeId, TInferCardValues } from "@/server/trpc/api/ui/types";

export type TInferValueFormProps<T extends TCardTypeId> = {
  onFormSubmit: (props: TInferOnFormSubmitProps<T>) => void;
  isPendingForm: boolean;
};

export type TInferOnFormSubmitProps<T extends TCardTypeId> = {
  values: TInferCardValues<T>;
  variant?: string;
};

export type TInferOnFormSubmitFunction<T extends TCardTypeId> = (
  props: TInferOnFormSubmitProps<T>
) => void;
