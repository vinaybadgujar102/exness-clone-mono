import { useAuthUiStore } from "@/stores/auth-ui-store";
import { useWebTradingUiStore } from "@/stores/webtrading-ui-store";
import { AssetSymbols } from "@repo/types";

export function resetSessionScopedStores() {
  useAuthUiStore.setState({ tab: "signin", lastConflictNotice: null });
  useWebTradingUiStore.setState({
    selectedAsset: AssetSymbols.BTC,
    posTab: "open",
    margin: 100,
    leverage: 10,
    chartInterval: "5m",
    instrumentSearch: "",
  });
}
