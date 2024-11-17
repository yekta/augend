export function useConditionalValue({
  isPending,
  data,
}: {
  isPending: boolean;
  data: any | undefined;
}) {
  return <T>(value: T, short = false) => {
    let val: T | string = short ? "Error" : "Err";
    if (isPending) {
      val = short ? "Load" : "Loading";
    } else if (value !== undefined && data !== undefined) {
      val = value;
    }
    return val;
  };
}
