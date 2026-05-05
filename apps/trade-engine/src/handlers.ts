import type { CreateOrderSchema } from "@repo/types";
import { currentAssetPrices, users, type Trade } from "./inMemoryDb";
import type z from "zod";

export function createTrade(
  email: string,
  trade: z.infer<typeof CreateOrderSchema>,
): { success: boolean; message: string } {
  const { asset, margin, leverage, side, id } = trade.payload.trade;
  const user = users.find((user) => user.email === email);
  if (!user) {
    return {
      success: false,
      message: "USER_NOT_FOUND",
    };
  }
  console.log(asset);
  const engineAsset = currentAssetPrices[asset];
  if (!engineAsset) {
    return {
      success: false,
      message: "ASSET_PRICE_NOT_FOUND",
    };
  }

  const price = side === "BUY" ? engineAsset.buyPrice : engineAsset.sellPrice;

  const notional = margin * leverage;

  const quantity = notional / price;

  // check margin
  if (user.balance < margin) {
    return {
      success: false,
      message: "NO_MARGIN",
    };
  }

  user.balance -= margin;

  const liquidationPrice =
    side === "BUY" ? price * (1 - 1 / leverage) : price * (1 + 1 / leverage);

  const createdTrade: Trade = {
    id,
    email,
    asset,
    side,
    liquidationPrice,
    entryPrice: price,
    margin,
    leverage,
    notional,
    quantity,
    pnl: 0,
    status: "OPEN",
    createdAt: Date.now(),
  };
  user.openTrades[createdTrade.id] = createdTrade;

  return {
    success: true,
    message: "TRADE_CREATED",
  };
}

export function closeTrade(
  email: string,
  tradeId: string,
): { success: boolean; message: string; balance?: number } {
  const user = users.find((user) => user.email === email);
  if (!user) {
    return {
      success: false,
      message: "USER_NOT_FOUND",
    };
  }

  const tradeToClose = user.openTrades[tradeId];
  if (!tradeToClose) {
    return {
      success: false,
      message: "TRADE_NOT_FOUND",
    };
  }

  if (tradeToClose.status === "CLOSED") {
    return {
      success: false,
      message: "TRADE_ALREADY_CLOSED",
    };
  }

  const currentPrice =
    tradeToClose.side === "BUY"
      ? currentAssetPrices[tradeToClose.asset]?.sellPrice
      : currentAssetPrices[tradeToClose.asset]?.buyPrice;

  if (!currentPrice) {
    return {
      success: false,
      message: "ASSET_PRICE_NOT_FOUND",
    };
  }

  const direction = tradeToClose.side === "BUY" ? 1 : -1;
  const priceDiff = (currentPrice - tradeToClose.entryPrice) * direction;
  const pnl = priceDiff * tradeToClose.quantity;

  user.balance += tradeToClose.margin + pnl;
  delete user.openTrades[tradeId];

  return {
    success: true,
    message: "TRADE_CLOSED",
    balance: user.balance,
  };
}

export function liquidateTrades() {
  for (const user of users) {
    const tradesToLiquidate: string[] = [];

    for (const [tradeId, trade] of Object.entries(user.openTrades)) {
      const assetPrice = currentAssetPrices[trade.asset];

      if (!assetPrice || !trade.liquidationPrice) continue;

      if (
        (trade.side === "BUY" &&
          assetPrice.sellPrice <= trade.liquidationPrice) ||
        (trade.side === "SELL" && assetPrice.buyPrice >= trade.liquidationPrice)
      ) {
        tradesToLiquidate.push(tradeId);
      }
    }

    for (const tradeId of tradesToLiquidate) {
      closeTrade(user.email, tradeId);
    }
  }
}

export function getOpenTradesForUser(email: string) {
  const user = users.find((user) => user.email === email);
  if (!user) {
    return;
  }

  return user.openTrades;
}

/** Open trades plus wallet balance (free margin) for GET_OPEN_TRADES. */
export function getAccountSnapshotForUser(email: string):
  | { trades: Trade[]; balance: number }
  | undefined {
  const user = users.find((u) => u.email === email);
  if (!user) return undefined;
  return {
    trades: Object.values(user.openTrades),
    balance: user.balance,
  };
}

export function handleAddUser(email: string) {
  const user = users.find((user) => user.email === email);
  if (user) {
    return {
      success: true,
      message: "USER_ALREADY_PRESENT",
    };
  }

  const newUser = {
    balance: 10000,
    email,
    openTrades: {},
  };
  users.push(newUser);

  return {
    success: true,
    message: "USER_ADDED",
  };
}
