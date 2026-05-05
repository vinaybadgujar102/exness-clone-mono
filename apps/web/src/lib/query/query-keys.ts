export const queryKeys = {
  auth: {
    root: ["auth"] as const,
    session: () => ["auth", "session"] as const,
  },
  trades: {
    root: ["trades"] as const,
    openPositions: () => ["trades", "open-positions"] as const,
  },
  chart: {
    root: ["chart"] as const,
    klines: (asset: string, interval: string) =>
      ["chart", "klines", asset, interval] as const,
  },
};
