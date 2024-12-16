import CardValuesFormWrapper from "@/components/cards/_utils/values-form/form-wrapper";
import CardValuesFormSubmitButton from "@/components/cards/_utils/values-form/submit-button";
import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import { TCardTypeId } from "@/server/trpc/api/ui/types";

export function ValueFormWithNoValue<T extends TCardTypeId>({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<T>) {
  const onFormSubmitLocal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onFormSubmit({ values: {} as any });
  };

  return (
    <CardValuesFormWrapper onSubmit={onFormSubmitLocal}>
      <CardValuesFormSubmitButton isPending={isPendingForm} />
    </CardValuesFormWrapper>
  );
}
