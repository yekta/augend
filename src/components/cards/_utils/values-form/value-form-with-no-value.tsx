import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import { TValueFormProps } from "@/components/cards/_utils/values-form/types";

export function ValueFormWithNoValue({
  onFormSubmit,
  isPendingForm,
}: TValueFormProps) {
  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFormSubmit([]);
  };

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
