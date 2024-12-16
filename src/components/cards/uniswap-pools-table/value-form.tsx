import { TInferValueFormProps } from "@/components/cards/_utils/values-form/types";
import { ValueFormWithNoValue } from "@/components/cards/_utils/values-form/value-form-with-no-value";

export default function UniswapPoolsTableValueForm({
  onFormSubmit,
  isPendingForm,
}: TInferValueFormProps<"uniswap_pools_table">) {
  return (
    <ValueFormWithNoValue
      onFormSubmit={onFormSubmit}
      isPendingForm={isPendingForm}
    />
  );
}
