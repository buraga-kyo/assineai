# Imagem da api do AssineAi em estagios. Por enquanto so o alvo `migracao`
# (roda as migrations e sai); api e worker entram na issue de deploy.
# Build a partir da raiz do repositorio: infra/compose.prod.yml ja faz isso.

FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# So os manifestos primeiro, para o install ficar em cache enquanto o codigo
# muda. O lockfile congelado cobre o workspace inteiro, entao todos entram.
FROM base AS build
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/assinatura/package.json packages/assinatura/
COPY packages/config/package.json packages/config/
COPY packages/modelos/package.json packages/modelos/
COPY packages/ui/package.json packages/ui/
RUN pnpm --filter @assineai/api... install --frozen-lockfile

COPY packages/config packages/config
COPY apps/api apps/api
RUN pnpm --filter @assineai/api build
# tira as dependencias de desenvolvimento antes de copiar para a imagem final
RUN pnpm --filter @assineai/api... install --frozen-lockfile --prod

# Alvo enxuto: so o que o node precisa para rodar apps/api/dist.
FROM node:22-slim AS migracao
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
CMD ["node", "apps/api/dist/banco/migrar.js"]

# Alvo da API com Typst instalado
FROM node:22-slim AS api
ENV NODE_ENV=production
# Instalar dependências para o wget e typst
RUN apt-get update && apt-get install -y wget xz-utils && rm -rf /var/lib/apt/lists/*
RUN wget -qO- https://github.com/typst/typst/releases/latest/download/typst-x86_64-unknown-linux-musl.tar.xz | tar -xJ -C /usr/local/bin --strip-components=1 typst-x86_64-unknown-linux-musl/typst
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
CMD ["node", "apps/api/dist/servidor.js"]

# Alvo para rodar a API e Worker com Python para o OpenTimestamps
FROM node:22-slim AS worker
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && rm -rf /var/lib/apt/lists/*
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install opentimestamps-client
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/apps/api/package.json apps/api/
COPY --from=build /app/apps/api/node_modules apps/api/node_modules
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
CMD ["node", "apps/api/dist/worker.js"]
