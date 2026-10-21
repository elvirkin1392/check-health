# Builds the server only. The build context is the repository root because the
# server imports shared/, and Docker cannot COPY from outside its context.
FROM node:24-slim

ENV NODE_ENV=production
WORKDIR /app

# The workspace manifests first, so a dependency install is cached until one
# of them actually changes.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json

# Only the server workspace is installed; the client is built and served
# separately (GitHub Pages), it has no part in this image.
RUN npm ci --workspace @check-health/server --include-workspace-root

COPY shared/ ./shared/
COPY server/ ./server/

# Cloud Run provides PORT; server.tsx falls back to 3000 when it is absent.
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/server
CMD ["npx", "tsx", "server.tsx"]
