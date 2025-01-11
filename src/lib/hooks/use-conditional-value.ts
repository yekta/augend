export function useConditionalValue({
  isPending,
  data,
  loadingText = "Loading",
  loadingTextShort = "Load",
  errorText = "Error",
  errorTextShort = "Err",
  formatter,
}: {
  isPending: boolean;
  data: any | undefined;
  loadingText?: string;
  loadingTextShort?: string;
  errorText?: string;
  errorTextShort?: string;
  formatter?: (value: any) => string;
}) {
  return <T>(value: T, short = false) => {
    let val: T | string = short ? errorTextShort : errorText;
    if (isPending) {
      val = short ? loadingTextShort : loadingText;
    } else if (value !== undefined && data !== undefined) {
      val = value;
      if (formatter) val = formatter(val);
    }
    return val;
  };
}
