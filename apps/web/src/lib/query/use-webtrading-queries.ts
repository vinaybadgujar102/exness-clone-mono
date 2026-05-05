import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getOpenPositions,
  postCloseTrade,
  postOpenTrade,
  type OpenTradePayload,
} from "@/lib/api";
import { invalidateOpenPositions } from "@/lib/query/invalidation-rules";
import { queryKeys } from "@/lib/query/query-keys";

export function useOpenPositionsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.trades.openPositions(),
    queryFn: getOpenPositions,
    enabled,
  });
}

export function useOpenTradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpenTradePayload) => postOpenTrade(payload),
    onSuccess: async () => {
      await invalidateOpenPositions(queryClient);
    },
  });
}

export function useCloseTradeMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tradeId: string) => postCloseTrade(tradeId),
    onSuccess: async () => {
      await invalidateOpenPositions(queryClient);
    },
  });
}
