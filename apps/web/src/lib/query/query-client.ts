import { QueryClient } from "@tanstack/react-query";

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 500;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (failureCount >= MAX_RETRIES) return false;
          const message = error instanceof Error ? error.message : "";
          return !/401|403/i.test(message);
        },
        retryDelay: (attemptIndex) =>
          Math.min(BASE_BACKOFF_MS * 2 ** attemptIndex, 4_000),
        staleTime: 10_000,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
