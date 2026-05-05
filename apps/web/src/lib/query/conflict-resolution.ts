type ConflictResolutionInput<T> = {
  previousLocalDraft: T | null;
  latestServerState: T;
};

export type ConflictResolutionResult<T> = {
  resolvedState: T;
  droppedLocalDraft: boolean;
  notice: string | null;
};

export function resolveServerWinsConflict<T>({
  previousLocalDraft,
  latestServerState,
}: ConflictResolutionInput<T>): ConflictResolutionResult<T> {
  if (previousLocalDraft == null) {
    return { resolvedState: latestServerState, droppedLocalDraft: false, notice: null };
  }

  return {
    resolvedState: latestServerState,
    droppedLocalDraft: true,
    notice: "Server data was updated and replaced your local draft.",
  };
}
