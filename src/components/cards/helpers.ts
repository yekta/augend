export function getNumberColorClass(
  n: number | "positive" | "negative",
  hasBg = false
) {
  let className = `${hasBg ? "text-foreground/80" : "text-foreground"}${
    hasBg ? " bg-foreground/8" : ""
  }`;
  if (n === "positive")
    className = `text-success${hasBg ? " bg-success/12" : ""}`;
  else if (n === "negative")
    className = `text-destructive${hasBg ? " bg-destructive/12" : ""}`;
  else if (n >= 50) className = `text-chart-6${hasBg ? " bg-chart-6/12" : ""}`;
  else if (n >= 10) className = `text-chart-4${hasBg ? " bg-chart-4/12" : ""}`;
  else if (n >= 5) className = `text-chart-1${hasBg ? " bg-chart-1/12" : ""}`;
  else if (n >= 1) className = `text-chart-3${hasBg ? " bg-chart-3/12" : ""}`;
  return className;
}
