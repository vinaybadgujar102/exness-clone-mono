type TradingMetricsPanelProps = {
  equityText: string;
  isStale: boolean;
};

export function TradingMetricsPanel({
  equityText,
  isStale,
}: TradingMetricsPanelProps) {
  return (
    <span
      className={`text-xs font-medium tabular-nums ${isStale ? "text-[#8b95a8]" : "text-[#e8ecf4]"}`}
      aria-live="polite"
    >
      {equityText}
    </span>
  );
}

