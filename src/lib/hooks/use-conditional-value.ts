export function useConditionalValue({
  isPending,
  data,
  loadingText = "Loading",
  loadingTextShort = "Load",
  errorText = "Error",
  errorTextShort = "Err",
}: {
  isPending: boolean;
  data: any | undefined;
  loadingText?: string;
  loadingTextShort?: string;
  errorText?: string;
  errorTextShort?: string;
}) {
  return <T>(value: T, short = false) => {
    let val: T | string = short ? errorTextShort : errorText;
    if (isPending) {
      val = short ? loadingTextShort : loadingText;
    } else if (value !== undefined && data !== undefined) {
      val = value;
    }
    return val;
  };
}
