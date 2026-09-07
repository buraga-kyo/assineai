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
