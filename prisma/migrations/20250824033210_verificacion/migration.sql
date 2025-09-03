-- CreateTable
CREATE TABLE "public"."VerificacionToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificacionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificacionToken_token_key" ON "public"."VerificacionToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificacionToken_usuarioId_key" ON "public"."VerificacionToken"("usuarioId");

-- CreateIndex
CREATE INDEX "VerificacionToken_token_idx" ON "public"."VerificacionToken"("token");

-- AddForeignKey
ALTER TABLE "public"."VerificacionToken" ADD CONSTRAINT "VerificacionToken_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
