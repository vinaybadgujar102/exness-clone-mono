import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query/query-keys";

export function invalidateOpenPositions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.trades.openPositions() });
}

export function invalidateClosedPositions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: queryKeys.trades.closedPositions(),
  });
}

export function invalidateAuthSession(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
}
