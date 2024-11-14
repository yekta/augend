export function getNumberColorClass(n: number, hasBg = false) {
  let className = `${hasBg ? "text-foreground/80" : "text-foreground"}${
    hasBg ? " bg-foreground/8" : ""
  }`;
  if (n >= 1000) className = `text-chart-4${hasBg ? " bg-chart-4/12" : ""}`;
  else if (n >= 500) className = `text-chart-1${hasBg ? " bg-chart-1/12" : ""}`;
  else if (n >= 100) className = `text-chart-3${hasBg ? " bg-chart-3/12" : ""}`;
  return className;
}
