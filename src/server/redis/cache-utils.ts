function compare<T>(a: T, b: T): number {
  if (typeof a === "number" && typeof b === "number") {
    return (a - b) as number;
  }
  if (typeof a === "string" && typeof b === "string") {
    return a.localeCompare(b, "en-US") as number;
  }
  return 0;
}

export function cleanArray<T>(arr: T[]) {
  if (arr.length === 0) return [];

  return Array.from(new Set(arr));
}

export function cleanAndSortArray<T>(arr: T[]) {
  if (arr.length === 0) return [];

  const cleanedArr = cleanArray(arr);
  const firstEl = cleanedArr[0];

  if (typeof firstEl === "number" || typeof firstEl === "string") {
    return cleanedArr.sort((a, b) => compare(a, b)) as T[];
  }
  return cleanedArr.sort();
}

export function createCacheKeyForTRPCRoute(path: string, rawInput: unknown) {
  function normalizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return cleanAndSortArray(value);
    }
    if (value && typeof value === "object") {
      return Object.entries(value)
        .sort(([keyA], [keyB]) => compare(keyA, keyB))
        .map(([k, v]) => [k, normalizeValue(v)]);
    }
    return value;
  }

  const normalizedInput = normalizeValue(rawInput);
  return `${path}:${JSON.stringify(normalizedInput)}`;
}
