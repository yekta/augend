export function linearInterpolation(
  value: number,
  input: [number, number],
  output: [number, number]
) {
  const [inputMin, inputMax] = input;
  const [outputMin, outputMax] = output;
  const ratio = (value - inputMin) / (inputMax - inputMin);
  return ratio * (outputMax - outputMin) + outputMin;
}
