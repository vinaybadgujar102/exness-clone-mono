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
): { success: boolean; message: string } {
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

  // return the trade and in backend store closed trade in db
  return {
    success: true,
    message: "TRADE_CLOSED",
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
