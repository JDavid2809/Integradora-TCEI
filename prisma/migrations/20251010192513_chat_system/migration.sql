-- CreateEnum
CREATE TYPE "public"."TipoChatRoom" AS ENUM ('GENERAL', 'CLASE', 'PRIVADO', 'SOPORTE');

-- CreateEnum
CREATE TYPE "public"."TipoMensaje" AS ENUM ('TEXTO', 'IMAGEN', 'ARCHIVO', 'SISTEMA');

-- CreateTable
CREATE TABLE "public"."chat_room" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "tipo" "public"."TipoChatRoom" NOT NULL DEFAULT 'GENERAL',
    "creado_por" INTEGER NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_participant" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "unido_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_visto" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "chat_participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_message" (
    "id" SERIAL NOT NULL,
    "chat_room_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo" "public"."TipoMensaje" NOT NULL DEFAULT 'TEXTO',
    "archivo_url" VARCHAR(255),
    "archivo_nombre" VARCHAR(100),
    "enviado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editado_en" TIMESTAMP(3),
    "eliminado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "chat_message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chat_room_creado_por_idx" ON "public"."chat_room"("creado_por");

-- CreateIndex
CREATE INDEX "chat_participant_chat_room_id_idx" ON "public"."chat_participant"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_participant_usuario_id_idx" ON "public"."chat_participant"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "chat_participant_chat_room_id_usuario_id_key" ON "public"."chat_participant"("chat_room_id", "usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_chat_room_id_idx" ON "public"."chat_message"("chat_room_id");

-- CreateIndex
CREATE INDEX "chat_message_usuario_id_idx" ON "public"."chat_message"("usuario_id");

-- CreateIndex
CREATE INDEX "chat_message_enviado_en_idx" ON "public"."chat_message"("enviado_en");

-- AddForeignKey
ALTER TABLE "public"."chat_room" ADD CONSTRAINT "chat_room_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "public"."usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participant" ADD CONSTRAINT "chat_participant_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_participant" ADD CONSTRAINT "chat_participant_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message" ADD CONSTRAINT "chat_message_chat_room_id_fkey" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_message" ADD CONSTRAINT "chat_message_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
