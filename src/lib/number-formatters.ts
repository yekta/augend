export function formatNumberTBMK(
  number: number,
  maxSignificantDigits: number = 4,
  shouldPad: boolean = false
): string {
  const suffixes = [
    { value: 1e12, symbol: "T" },
    { value: 1e9, symbol: "B" },
    { value: 1e6, symbol: "M" },
    { value: 1e3, symbol: "K" },
    { value: 1, symbol: "" },
  ];

  // Handle negative numbers
  const isNegative = number < 0;
  const absNumber = Math.abs(number);

  let suffix = "";
  let scaledNumber = absNumber;

  // Determine the appropriate suffix
  for (const s of suffixes) {
    if (absNumber >= s.value) {
      scaledNumber = absNumber / s.value;
      suffix = s.symbol;
      break;
    }
  }

  // Format the scaled number with maxSignificantDigits precision
  let numberPartStr = scaledNumber.toPrecision(maxSignificantDigits);

  // Remove trailing zeros if shouldPad is false
  if (!shouldPad && numberPartStr.includes(".")) {
    numberPartStr = numberPartStr.replace(/0+$/, "").replace(/\.$/, "");
  }

  // If the number starts with "0.", remove the leading zero
  if (numberPartStr.startsWith("0.")) {
    numberPartStr = numberPartStr.slice(1);
  }

  // Prepend negative sign if necessary
  const formattedNumber = (isNegative ? "-" : "") + numberPartStr + suffix;

  return formattedNumber;
}
