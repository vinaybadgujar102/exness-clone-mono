const USD_DIGITS = 2;

export function roundUsd2(value: number): number {
  return Number(value.toFixed(USD_DIGITS));
}

export function formatUsd2(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: USD_DIGITS,
    maximumFractionDigits: USD_DIGITS,
  });
}

