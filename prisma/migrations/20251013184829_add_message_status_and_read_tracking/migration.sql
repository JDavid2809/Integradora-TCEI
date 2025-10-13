-- AlterTable
ALTER TABLE "public"."chat_message" ADD COLUMN     "entregado_en" TIMESTAMP(3),
ADD COLUMN     "visto_en" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."chat_message_read" (
    "id" SERIAL NOT NULL,
    "mensaje_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "leido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_message_read_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_message_read_mensaje_id_idx" ON "public"."chat_message_read"("mensaje_id");

-- CreateIndex
CREATE INDEX "chat_message_read_usuario_id_idx" ON "public"."chat_message_read"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_message_read_mensaje_id_usuario_id_key" ON "public"."chat_message_read"("mensaje_id", "usuario_id");

-- AddForeignKey
ALTER TABLE "public"."chat_message_read" ADD CONSTRAINT "chat_message_read_mensaje_id_fkey" FOREIGN KEY ("mensaje_id") REFERENCES "public"."chat_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message_read" ADD CONSTRAINT "chat_message_read_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
