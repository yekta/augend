import { TValueFormProps } from "@/components/cards/_utils/values-form/types";
import { ValueFormWithNoValue } from "@/components/cards/_utils/values-form/value-form-with-no-value";

export function CryptoTableValueForm({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  return (
    <ValueFormWithNoValue
      onFormSubmit={onFormSubmit}
      isPendingForm={isPendingForm}
    />
  );
}
