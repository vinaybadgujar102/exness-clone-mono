type AccountSummaryProps = {
  equityText: string;
  balanceText: string;
  usedMarginText: string;
  remainingMarginText: string;
  isStale: boolean;
};

export function AccountSummary({
  equityText,
  balanceText,
  usedMarginText,
  remainingMarginText,
  isStale,
}: AccountSummaryProps) {
  const metricValueClass = isStale ? "text-[#8b95a8] tabular-nums" : "text-white tabular-nums";

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[#2a2e39] bg-[#14171f] px-3 py-1.5 text-[10px] text-[#8b95a8]">
      <span>
        Equity <span className={metricValueClass}>{equityText}</span>
      </span>
      <span>
        Balance <span className={metricValueClass}>{balanceText}</span>
      </span>
      <span>
        Margin <span className={metricValueClass}>{usedMarginText}</span>
      </span>
      <span>
        Remaining <span className={metricValueClass}>{remainingMarginText}</span>
      </span>
    </div>
  );
}

