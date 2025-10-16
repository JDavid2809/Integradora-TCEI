
# Proyecto Inglés - Guía para levantar en desarrollo

## Requisitos previos

- Docker instalado y el daemon Docker corriendo.
- Node.js y npm instalados.

---

## Pasos para levantar la aplicación

### 1. Levantar la base de datos

Desde la carpeta donde está tu `docker-compose.yml` ejecuta

```
docker compose up -d
```

Esto iniciará el contenedor PostgreSQL con la configuración definida.



### 2. Configurar variables de entorno

* Copia `.env.template` y renómbralo a `.env`.
* Edita `.env` y cambia las variables por las adecuadas a tu entorno.

Ejemplo para `DATABASE_URL`:

```
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/nombre_de_basededatos"
```

> Recuerda que `usuario`, `contraseña` y `nombre_de_base` deben coincidir con lo que definiste en el `docker-compose.yml`.

### ¿Cómo generar un NEXTAUTH_SECRET?

Puedes generar uno seguro ejecutando en consola:
```
    openssl rand -base64 32
```

Esto generará una `clave aleatoria` como:
```
0U9hZ+N1MxLk/Vy9nVQ8q6Ow5FHpZUxAa2FyMnZGmkU=
```
Usa esa clave como valor de NEXTAUTH_SECRET en tu .env.

---

### 3. Instalar dependencias

```
npm i
```

---

### 4. Ejecutar la aplicación

```
npm run dev
```

---

### 5. Ejecutar comandos de Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

* `migrate dev` crea y aplica las migraciones en la base.
* `generate` genera el cliente Prisma para el proyecto.

---

## Resumen de comandos Prisma

```bash
npx prisma init        # Solo la primera vez, para inicializar Prisma
npx prisma migrate dev # Aplica migraciones
npx prisma generate    # Genera cliente Prisma
```

---

## Ejemplo de archivo `.env.template`

```env
DATABASE_URL="postgresql://GalletasMarias:GalletasMarias@localhost:5432/english-DB"
NEXTAUTH_SECRET=06bdddb2c8f1b7fe444aa421c8d860e5
```

---

## Configuracion de stripe para pagos

## Requisitos
- Cuenta de Stripe (modo test): [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
- Stripe CLI instalado: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

### 1. Obtener las claves de API de Stripe

1. Ve al [Dashboard de Stripe](https://dashboard.stripe.com/test/apikeys)
2. Asegúrate de estar en **modo test** (esquina superior izquierda)
3. Copia las siguientes claves:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)


### 2. Configurar variables de entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Stripe Keys (modo test)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
 ⚠️ **Importante:** El `STRIPE_WEBHOOK_SECRET` lo obtendrás en el siguiente paso.

### 3- Login en Stripe CLI
- Autenticarse
```
stripe login
```

### 4. Iniciar el webhook listener (desarrollo)

En una **terminal separada**, ejecuta:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Output esperado:**
```
> Ready! Your webhook signing secret is whsec_abc123...
> Waiting for events...
```

**Copia el `webhook signing secret`** que aparece y agrégalo a tu `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_abc123...
```

---

### 5. Reiniciar la aplicación

```bash
# Detener el servidor (Ctrl + C)
# Reiniciar
npm run dev
```

### 6 Datos de tarjeta para test (TARJETA FICTICIA)
- NumberCard: 4242424242424242 
- Fecha-caducidad: 02/33 - Puede ser cual sea
- CVC: 478 - Puede ser cual sea
- Nombre: testnuevo - Puede ser cual sea

Ahora tu aplicación puede recibir eventos de Stripe en tiempo real.
---


## Notas importantes

* El nombre de la base de datos (por ejemplo, `english-DB`) debe existir o será creado por Prisma cuando ejecutes las migraciones.
* El usuario y contraseña deben coincidir con las variables `POSTGRES_USER` y `POSTGRES_PASSWORD` definidas en el `docker-compose.yml`.
* `NEXTAUTH_SECRET` es la clave para cifrar sesiones en NextAuth y debe mantenerse secreta.

---

Si tienes dudas o problemas, avísame. ¡Suerte con el proyecto! 🚀

```
