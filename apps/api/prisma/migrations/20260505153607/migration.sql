-- CreateEnum
CREATE TYPE "PrismaAssetSymbols" AS ENUM ('ETHUSDT', 'BTCUSDT');

-- CreateEnum
CREATE TYPE "OrderSide" AS ENUM ('BUY', 'SELL');

-- CreateTable
CREATE TABLE "PastTrades" (
    "id" SERIAL NOT NULL,
    "asset" "PrismaAssetSymbols" NOT NULL,
    "side" "OrderSide" NOT NULL,
    "entryPrice" INTEGER NOT NULL,
    "margin" INTEGER NOT NULL,
    "leverage" INTEGER NOT NULL,
    "notional" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "pnl" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "liquidationPrice" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PastTrades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assets" (
    "id" SERIAL NOT NULL,
    "symbol" "PrismaAssetSymbols" NOT NULL,
    "decimal" INTEGER NOT NULL,
    "spread" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "Assets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PastTrades" ADD CONSTRAINT "PastTrades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
