# Portable container build for the Prodigi backend — an alternative to
# Render's native Node runtime (render.yaml), for other hosts or local
# docker-compose parity. Self-contained: the committed
# src/knowledge/prodigi-knowledge.json means this build never needs the
# frontend's source tree. See docs/BACKEND.md.
#
# Build from the server/ directory: `docker build -t prodigi-backend .`
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["node", "dist/index.js"]
