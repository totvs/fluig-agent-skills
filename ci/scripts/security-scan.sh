#!/usr/bin/env bash
#
# security-scan.sh — Scan de segurança das skills.
#
# Constrói o skill-scanner (Cisco AI Defense) e o executa sobre o diretório
# skills/, que contém as skills em nível único (skills/{skill}/SKILL.md). O
# comando scan-all descobre e analisa cada */SKILL.md sob o diretório informado.
#
set -euo pipefail
set -x

BASE_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
SKILLS_DIR="$BASE_DIR/skills"

cd "$BASE_DIR"

echo "==> [1/4] Instalando o gerenciador uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo "==> [2/4] Clonando o repositório skill-scanner..."
git clone https://github.com/cisco-ai-defense/skill-scanner

echo "==> [3/4] Construindo o skill-scanner..."
cd skill-scanner
uv sync --all-extras
SCANNER="$(pwd)/.venv/bin/skill-scanner"
cd "$BASE_DIR"

echo "==> [4/4] Executando skill-scanner scan-all em '$SKILLS_DIR'..."
"$SCANNER" scan-all "$SKILLS_DIR"

echo "✅ Scan de segurança concluído com sucesso!"
