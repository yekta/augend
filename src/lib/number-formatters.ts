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

  let numberPartStr = "";

  if (absNumber < 1) {
    // For numbers less than 1, adjust decimal digits to maintain significant digits
    const numStr = scaledNumber.toString();

    // Match leading zeros after the decimal point
    const match = numStr.match(/^0\.0*(\d+)/);
    let leadingZeros = 0;
    if (match) {
      leadingZeros = match[0].length - 2 - match[1].length;
    }

    // Total decimal digits needed to maintain significant digits
    const decimalDigits = leadingZeros + maxSignificantDigits;

    // Format the number with the calculated decimal digits
    numberPartStr = scaledNumber.toFixed(decimalDigits);

    if (!shouldPad) {
      // Remove any trailing zeros
      numberPartStr = numberPartStr.replace(/0+$/, "");

      // Remove decimal point if it's at the end
      numberPartStr = numberPartStr.replace(/\.$/, "");
    }
  } else {
    // For numbers >= 1, proceed with existing logic

    // Determine the number of integer digits
    let integerDigits = Math.floor(scaledNumber).toString().length;

    // Determine the number of decimal digits needed
    let decimalDigits = maxSignificantDigits - integerDigits;

    // Adjust decimalDigits if negative
    if (decimalDigits < 0) decimalDigits = 0;

    // Format the scaled number with the required decimal digits
    numberPartStr = scaledNumber.toFixed(decimalDigits);

    if (!shouldPad) {
      // Remove unnecessary trailing zeros and decimal point
      numberPartStr = numberPartStr.replace(/\.?0+$/, "");
    }
  }

  // If the number starts with "0.", remove the leading zero
  if (numberPartStr.startsWith("0.")) {
    numberPartStr = numberPartStr.slice(1);
  }

  // Prepend negative sign if necessary
  const formattedNumber = (isNegative ? "-" : "") + numberPartStr + suffix;

  return formattedNumber;
}
