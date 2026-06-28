# ── Stage 1: build the Vite frontend ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

# ── Stage 2: production runtime ───────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app

# Only production dependencies (express, multer, dotenv).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Server code + the one src file it imports at startup (defaultTrip).
COPY server ./server
COPY src/data ./src/data

# Built frontend from stage 1.
COPY --from=build /app/dist ./dist

# server/data is where trip.json and uploads live — mount a volume here.
VOLUME ["/app/server/data"]

EXPOSE 3001

CMD ["node", "server/index.js"]
