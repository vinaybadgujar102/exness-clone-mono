type ConflictNoticeProps = {
  message: string | null;
  onDismiss?: () => void;
};

export function ConflictNotice({ message, onDismiss }: ConflictNoticeProps) {
  if (!message) return null;
  return (
    <div className="flex items-center justify-between gap-2 rounded border border-amber-400/40 bg-amber-300/10 px-3 py-2 text-xs text-amber-200">
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="rounded border border-amber-300/30 px-2 py-0.5 text-[11px] hover:bg-amber-200/10"
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
