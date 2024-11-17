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

export function cleanEnvVar(envVar: string | undefined) {
  if (envVar === undefined) return envVar;
  return envVar.replace(/\s+/g, "");
}

export function timeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const formatNumberShort = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const formatNumber = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 1 });

  if (seconds < 60) return `${formatNumberShort(seconds)}s ago`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${formatNumberShort(minutes)}m ago`;

  const hours = minutes / 60;
  if (hours < 24) return `${formatNumber(hours)}h ago`;

  const days = hours / 24;
  if (days < 30) return `${formatNumber(days)}d ago`;

  const months = days / 30;
  if (months < 12) return `${formatNumber(months)}M ago`;

  const years = days / 365;
  return `${formatNumber(years)}y ago`;
}
