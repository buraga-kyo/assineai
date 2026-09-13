#!/bin/bash
set -euo pipefail

DEST_DIR="$(dirname "$0")/../Arquivos/Permanente"
JAR_FILE="$DEST_DIR/JSignPdf.jar"
CERT_FILE="$DEST_DIR/cert-teste.pfx"

mkdir -p "$DEST_DIR"

if [ ! -f "$JAR_FILE" ]; then
  echo "Copiando JSignPdf.jar do repositório legado..."
  cp ~/Documentos/assineai/Arquivos/Permanente/JSignPdf.jar "$JAR_FILE" || echo "Você precisa baixar o JSignPdf.jar e colocar em Arquivos/Permanente/"
fi

if [ ! -f "$CERT_FILE" ]; then
  echo "Copiando cert-teste.pfx do repositório legado..."
  cp ~/Documentos/assineai/Arquivos/Permanente/cert-teste.pfx "$CERT_FILE" || echo "Certificado não encontrado."
fi

echo "Dependências do motor de assinatura prontas."
