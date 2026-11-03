# Forja: studio + app server in one image.
#   docker build -t forja .
#   docker run -p 4100:4100 -v forja-data:/app/data -e SECRETS_KEY=... -e DATABASE_URL=postgres://... forja
# BROWSER=0 leaves out Chromium (browser_test then reports it is unavailable): a ~300 MB smaller image.

FROM node:24-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM deps AS build
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
ARG BROWSER=1
ENV NODE_ENV=production \
    PORT=4100 \
    DATA_DIR=/app/data \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
WORKDIR /app
# tsx runs the server from source, so the full node_modules travels (it is a dev dependency).
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY server ./server
COPY sdk ./sdk
COPY --from=build /app/dist ./dist
RUN if [ "$BROWSER" = "1" ]; then npx playwright-core install --with-deps chromium-headless-shell && rm -rf /var/lib/apt/lists/*; fi \
 && mkdir -p /app/data /app/node_modules/.forja-deps \
 && chown -R node:node /app/data /app/node_modules/.forja-deps
ENV FORJA_BROWSER=${BROWSER}
USER node
VOLUME /app/data
EXPOSE 4100
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"
CMD ["node", "--import", "tsx", "server/bootstrap/server.ts"]
