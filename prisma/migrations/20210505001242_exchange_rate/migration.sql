-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "uuid" UUID NOT NULL,
    "from" VARCHAR(3) NOT NULL,
    "to" VARCHAR(3) NOT NULL,
    "exchangeRate" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRate.uuid_unique" ON "ExchangeRate"("uuid");
