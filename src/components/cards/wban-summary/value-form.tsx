import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import { ValueFormWithNoValue } from "@/components/cards/_utils/values-form/value-form-with-no-value";

export default function WbanSummaryValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"wban_summary">) {
  return (
    <ValueFormWithNoValue
      onFormSubmit={onFormSubmit}
      isPendingForm={isPendingForm}
    />
  );
}
