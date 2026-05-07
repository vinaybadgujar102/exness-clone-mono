type AccountSummaryProps = {
  equityText: string;
  balanceText: string;
  freeMarginText: string;
  totalPnlText: string;
  totalPnlPositive: boolean;
  isStale: boolean;
};

export function AccountSummary({
  equityText,
  balanceText,
  freeMarginText,
  totalPnlText,
  totalPnlPositive,
  isStale,
}: AccountSummaryProps) {
  const metricValueClass = isStale
    ? "text-[#8b95a8] tabular-nums"
    : "text-white tabular-nums";
  const pnlValueClass = isStale
    ? "text-[#8b95a8] tabular-nums"
    : totalPnlPositive
      ? "text-[#26c281] tabular-nums"
      : "text-[#ef5350] tabular-nums";

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#2a2e39] bg-[#14171f] px-3 py-1.5 text-[10px] text-[#8b95a8]">
      <span>
        Equity <span className={metricValueClass}>{equityText}</span>
      </span>
      <span>
        Balance <span className={metricValueClass}>{balanceText}</span>
      </span>
      <span>
        Free Margin <span className={metricValueClass}>{freeMarginText}</span>
      </span>
      <span className="ml-auto">
        Total P/L <span className={pnlValueClass}>{totalPnlText}</span>
      </span>
    </div>
  );
}

