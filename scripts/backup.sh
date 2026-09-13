#!/bin/bash
set -e

BACKUP_DIR="/var/backups/assineai"
mkdir -p "$BACKUP_DIR"

DATE=$(date +%Y%m%d_%H%M%S)

echo "Iniciando backup do banco de dados..."
docker exec -t assineai-prod-postgres-1 pg_dump -U postgres -d assineai -F c -f "/tmp/assineai_$DATE.dump"
docker cp assineai-prod-postgres-1:"/tmp/assineai_$DATE.dump" "$BACKUP_DIR/"
docker exec -t assineai-prod-postgres-1 rm "/tmp/assineai_$DATE.dump"

echo "Backup concluído: $BACKUP_DIR/assineai_$DATE.dump"
