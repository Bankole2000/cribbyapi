-- CreateTable
CREATE TABLE "CityAddRequest" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL,
    "stateName" VARCHAR(255) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "countryName" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "addedToData" BOOLEAN DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StateAddRequest" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "stateCode" VARCHAR(2) NOT NULL,
    "countryCode" VARCHAR(2) NOT NULL,
    "countryName" VARCHAR(255) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "addedToData" BOOLEAN DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CityAddRequest.uuid_unique" ON "CityAddRequest"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "StateAddRequest.uuid_unique" ON "StateAddRequest"("uuid");
