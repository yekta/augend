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

export function timeAgo(number: number, short = false): string {
  const now = new Date();
  const date = new Date(number);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const formatNumberShort = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const formatNumber = (n: number) =>
    n.toLocaleString("en-US", { maximumFractionDigits: 1 });
  const suffix = short ? "" : " ago";

  if (seconds < 60) return `${formatNumberShort(seconds)}s${suffix}`;

  const minutes = seconds / 60;
  if (minutes < 60) return `${formatNumberShort(minutes)}m${suffix}`;

  const hours = minutes / 60;
  if (hours < 24) return `${formatNumber(hours)}h${suffix}`;

  const days = hours / 24;
  if (days < 30) return `${formatNumber(days)}d${suffix}`;

  const months = days / 30;
  if (months < 12) return `${formatNumber(months)}M${suffix}`;

  const years = days / 365;
  return `${formatNumber(years)}y${suffix}`;
}

export function timeAgoIntl(date: Date, now: Date): string {
  const rtf1 = new Intl.RelativeTimeFormat("en", {
    style: "narrow",
  });
  const sign = now.getTime() > date.getTime() ? -1 : 1;
  const seconds = Math.abs(Math.floor((date.getTime() - now.getTime()) / 1000));

  if (seconds < 60) {
    return rtf1.format(sign * Math.floor(seconds), "seconds");
  }

  const minutes = seconds / 60;
  if (minutes < 60) {
    return rtf1.format(sign * Math.floor(minutes), "minutes");
  }

  const hours = minutes / 60;
  if (hours < 24) {
    return rtf1.format(sign * Math.floor(hours), "hours");
  }

  const days = hours / 24;
  if (days < 30) {
    return rtf1.format(sign * Math.floor(days), "days");
  }

  const months = days / 30;
  if (months < 12) {
    return rtf1.format(sign * Math.floor(months), "months");
  }

  const years = days / 365;
  return rtf1.format(sign * (Math.floor(years * 10) / 10), "years");
}
