import {
  ASSETSCONFIG,
  BALANCE_SCALE,
  type CreateOrderSchema,
} from "@repo/types";
import { currentAssetPrices, users, type Trade } from "./inMemoryDb";
import type z from "zod";

export function createTrade(
  userId: number,
  trade: z.infer<typeof CreateOrderSchema>,
): { success: boolean; message: string; data?: Trade } {
  const { asset, margin, leverage, side, id } = trade.payload.trade;
  const user = users.find((user) => user.id === userId);
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

  const assetConfig = ASSETSCONFIG[asset];

  const price = side === "BUY" ? engineAsset.buyPrice : engineAsset.sellPrice;

  const notional = margin * leverage;

  const quantity = (notional * assetConfig.quantityScale) / price;

  // check margin
  if (user.balance < margin) {
    return {
      success: false,
      message: "NO_MARGIN",
    };
  }

  user.balance -= margin;

  const liquidationPrice =
    side === "BUY"
      ? price - Math.floor(price / leverage)
      : price + Math.floor(price / leverage);

  const createdTrade: Trade = {
    id,
    userId,
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
    data: createdTrade,
  };
}

export function closeTrade(
  userId: number,
  tradeId: string,
): { success: boolean; message: string; data?: Trade; balance?: number } {
  const user = users.find((user) => user.id === userId);
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

  const pnl =
    (priceDiff * tradeToClose.quantity * BALANCE_SCALE) /
    (ASSETSCONFIG[tradeToClose.asset].priceScale *
      ASSETSCONFIG[tradeToClose.asset].quantityScale);
  tradeToClose.pnl = pnl;
  tradeToClose.status = "CLOSED";

  user.balance += tradeToClose.margin + pnl;
  delete user.openTrades[tradeId];

  return {
    success: true,
    message: "TRADE_CLOSED",
    data: tradeToClose,
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
      closeTrade(user.id, tradeId);
    }
  }
}

export function getOpenTradesForUser(userId: number) {
  const user = users.find((user) => user.id === userId);
  if (!user) {
    return;
  }

  return user.openTrades;
}

/** Open trades plus wallet balance (free margin) for GET_OPEN_TRADES. */
export function getAccountSnapshotForUser(
  userId: number,
): { trades: Trade[]; balance: number } | undefined {
  const user = users.find((u) => u.id === userId);
  console.log(user);
  if (!user) return undefined;
  return {
    trades: Object.values(user.openTrades),
    balance: user.balance,
  };
}

export function handleAddUser(userId: number) {
  const user = users.find((user) => user.id === userId);
  if (user) {
    return {
      success: true,
      message: "USER_ALREADY_PRESENT",
    };
  }

  const newUser = {
    balance: 1000000, // scaled balanced
    id: userId,
    openTrades: {},
  };
  users.push(newUser);

  return {
    success: true,
    message: "USER_ADDED",
  };
}
