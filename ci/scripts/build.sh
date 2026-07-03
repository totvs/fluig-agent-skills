#!/usr/bin/env bash
#
# build.sh — Empacotamento dos artefatos para release (opcional).
#
# Empacota apenas os diretórios existentes neste projeto. Não inclui `agents`
# nem `instructions` (presentes na referência, mas inexistentes aqui).
#
set -euo pipefail
set -x

BASE_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
RELEASE_DIR="${RELEASE_DIR:-$BASE_DIR/release}"
PACKAGE_DIRS=(skills context examples)

cd "$BASE_DIR"

echo "==> [1/3] Criando o diretório de release em '$RELEASE_DIR'..."
mkdir -p "$RELEASE_DIR"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "==> [2/3] Empacotando diretórios existentes (${PACKAGE_DIRS[*]})..."
for dir in "${PACKAGE_DIRS[@]}"; do
  if [ -d "$BASE_DIR/$dir" ]; then
    echo "Packaging $dir"
    # A partir de BASE_DIR para que os caminhos internos ao zip sejam relativos.
    (cd "$BASE_DIR" && zip -r "$TMP_DIR/$dir.zip" "$dir")
  else
    echo "Skipping $dir (diretório ausente)"
  fi
done

if compgen -G "$TMP_DIR/*.zip" > /dev/null; then
  mv "$TMP_DIR"/*.zip "$RELEASE_DIR"/
fi

echo "==> [3/3] Listando os zips gerados em '$RELEASE_DIR'..."
if compgen -G "$RELEASE_DIR/*.zip" > /dev/null; then
  ls -1 "$RELEASE_DIR"/*.zip
else
  echo "No zip files generated."
fi

echo "✅ Empacotamento concluído com sucesso!"
