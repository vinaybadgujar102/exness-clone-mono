import { create } from "zustand";

import { AssetSymbols } from "@repo/types";
import type { ChartInterval } from "@/components/web-trading-chart";

type WebTradingUiState = {
  selectedAsset: AssetSymbols;
  posTab: "open" | "closed";
  margin: number;
  leverage: number;
  chartInterval: ChartInterval;
  instrumentSearch: string;
  setSelectedAsset: (asset: AssetSymbols) => void;
  setPosTab: (tab: "open" | "closed") => void;
  setMargin: (value: number) => void;
  setLeverage: (value: number) => void;
  setChartInterval: (value: ChartInterval) => void;
  setInstrumentSearch: (value: string) => void;
};

export const useWebTradingUiStore = create<WebTradingUiState>((set) => ({
  selectedAsset: AssetSymbols.BTC,
  posTab: "open",
  margin: 100,
  leverage: 10,
  chartInterval: "5m",
  instrumentSearch: "",
  setSelectedAsset: (selectedAsset) => set({ selectedAsset }),
  setPosTab: (posTab) => set({ posTab }),
  setMargin: (margin) => set({ margin }),
  setLeverage: (leverage) => set({ leverage }),
  setChartInterval: (chartInterval) => set({ chartInterval }),
  setInstrumentSearch: (instrumentSearch) => set({ instrumentSearch }),
}));
