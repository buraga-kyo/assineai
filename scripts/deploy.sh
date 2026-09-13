#!/bin/bash
set -e

# Script de deploy rápido para produção.
echo "Puxando atualizações do git..."
git pull origin main

echo "Fazendo build das imagens..."
docker compose -f infra/compose.prod.yml build

echo "Subindo os serviços..."
docker compose -f infra/compose.prod.yml up -d

echo "Limpando imagens velhas..."
docker image prune -f

echo "Deploy finalizado!"
