#!/usr/bin/env bash
# baixar-jsignpdf.sh — baixa o JSignPdf.jar 2.2.0 com segurança e verifica o hash SHA-256.

set -euo pipefail

VERSAO="2.2.0"
HASH_ESPERADO="43a72f42d9fae863e43580524ba980fc9c21ef0e9ec356fd15e7d5dd41320041"

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ALVO_DIR="$RAIZ/Arquivos/Permanente"
ALVO_JAR="$ALVO_DIR/JSignPdf.jar"

# Idempotência: se o arquivo já existir com o hash correto, não faz nada.
if [ -f "$ALVO_JAR" ]; then
  HASH_ATUAL="$(sha256sum "$ALVO_JAR" | cut -d' ' -f1)"
  if [ "$HASH_ATUAL" = "$HASH_ESPERADO" ]; then
    echo "JSignPdf.jar já existe e o hash é válido. Nada a fazer."
    exit 0
  fi
fi

echo "Baixando JSignPdf versão $VERSAO..."
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

ZIP_PATH="$TMP_DIR/jsignpdf.zip"

# Baixa o ZIP usando curl ou wget
if command -v curl >/dev/null 2>&1; then
  curl -L -s -o "$ZIP_PATH" "https://downloads.sourceforge.net/project/jsignpdf/stable/JSignPdf%202.2.0/jsignpdf-2.2.0.zip"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O "$ZIP_PATH" "https://downloads.sourceforge.net/project/jsignpdf/stable/JSignPdf%202.2.0/jsignpdf-2.2.0.zip"
else
  echo "ERRO: curl ou wget não encontrados no sistema." >&2
  exit 1
fi

echo "Extraindo JSignPdf.jar..."
unzip -q -j "$ZIP_PATH" "jsignpdf-$VERSAO/JSignPdf.jar" -d "$TMP_DIR" || {
  # Tenta sem o prefixo da pasta jsignpdf-X.X.X
  unzip -q -j "$ZIP_PATH" "JSignPdf.jar" -d "$TMP_DIR" || {
    echo "ERRO: Não foi possível extrair JSignPdf.jar do zip baixado." >&2
    exit 1
  }
}

EXTRAIDO="$TMP_DIR/JSignPdf.jar"
HASH_BAIXADO="$(sha256sum "$EXTRAIDO" | cut -d' ' -f1)"
if [ "$HASH_BAIXADO" != "$HASH_ESPERADO" ]; then
  echo "ERRO: O hash SHA-256 do JSignPdf.jar baixado ($HASH_BAIXADO) não confere com o esperado ($HASH_ESPERADO)." >&2
  exit 1
fi

mkdir -p "$ALVO_DIR"
cp "$EXTRAIDO" "$ALVO_JAR"
echo "✅ JSignPdf.jar instalado com sucesso em $ALVO_JAR!"
