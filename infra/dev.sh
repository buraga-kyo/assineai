#!/usr/bin/env bash
# infra/dev.sh: sobe e derruba a infra de desenvolvimento do AssineAi
# (Postgres com PostGIS, Redis, MinIO com o bucket assineai e Mailpit).
#
# Uso:
#   bash infra/dev.sh up               sobe tudo e espera ficar saudável
#   bash infra/dev.sh down             para e remove os containers, guarda os dados
#   bash infra/dev.sh down --volumes   idem, apagando banco e arquivos
#   bash infra/dev.sh ps               estado de cada serviço
#   bash infra/dev.sh logs [serviço]   acompanha os logs
#
# Os scripts pnpm `infra:up` e `infra:down` chegam com o monorepo (issue #38)
# e apontam para este arquivo; enquanto não existem, chame direto.
set -euo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
compose() { docker compose -f "$AQUI/compose.dev.yml" -p assineai-dev "$@"; }

case "${1:-}" in
  up)
    # o --wait conta serviço de uma passada como falha (o init sai com 0), então
    # ele espera só os quatro de longa vida; o init roda depois, e cobramos o 0
    compose up -d --wait --wait-timeout 180 postgres redis minio mailpit
    compose up -d minio-init
    rc="$(docker wait assineai-dev-minio-init)"
    if [ "$rc" != "0" ]; then
      compose logs --no-log-prefix minio-init >&2
      echo "minio-init saiu com $rc: o bucket assineai não foi criado" >&2
      exit 1
    fi
    compose ps -a
    echo "Mailpit: http://localhost:8025   Console do MinIO: http://localhost:9001"
    ;;
  down)
    shift
    compose down --remove-orphans "$@"
    ;;
  ps) compose ps -a ;;
  logs)
    shift
    compose logs -f "$@"
    ;;
  *)
    echo "uso: bash infra/dev.sh up | down [--volumes] | ps | logs [serviço]" >&2
    exit 2
    ;;
esac
