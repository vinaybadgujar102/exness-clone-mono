type StaleIndicatorProps = {
  isStale: boolean;
  isFetching: boolean;
  onRefresh: () => void;
  className?: string;
};

export function StaleIndicator({
  isStale,
  isFetching,
  onRefresh,
  className,
}: StaleIndicatorProps) {
  if (!isStale) return null;
  return (
    <div
      className={
        className ??
        "flex items-center gap-2 rounded border border-[#2a2e39] bg-[#14171f] px-2 py-1 text-[10px] text-[#8b95a8]"
      }
    >
      <span>Showing cached data</span>
      <button
        type="button"
        disabled={isFetching}
        onClick={onRefresh}
        className="rounded border border-[#3d4454] px-1.5 py-0.5 text-white disabled:opacity-50"
      >
        {isFetching ? "Refreshing..." : "Refresh"}
      </button>
    </div>
  );
}
