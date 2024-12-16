import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import { ValueFormWithNoValue } from "@/components/cards/_utils/values-form/value-form-with-no-value";

export default function BananoTotalValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"banano_total">) {
  return (
    <ValueFormWithNoValue
      onFormSubmit={onFormSubmit}
      isPendingForm={isPendingForm}
    />
  );
}
