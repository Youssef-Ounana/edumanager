# ─── Étape 1 : Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Compiler TypeScript
RUN npm run build

# ─── Étape 2 : Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# Copier les dépendances de production uniquement
COPY package*.json ./
RUN npm ci --only=production

# Copier le build et Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma/
COPY prisma.config.ts ./

EXPOSE 3001

CMD ["node", "dist/main"]