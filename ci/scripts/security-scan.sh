#!/usr/bin/env bash
#
# security-scan.sh — Scan de segurança das skills.
#
# Constrói o skill-scanner (Cisco AI Defense) e o executa sobre cada skill.
# As skills ficam em nível único (skills/{skill}/SKILL.md).
#
set -euo pipefail
set -x

BASE_DIR="${GITHUB_WORKSPACE:-$(pwd)}"
SKILLS_DIR="$BASE_DIR/skills"
PARALLELISM="${PARALLELISM:-4}"

cd "$BASE_DIR"

echo "==> [1/5] Instalando o gerenciador uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo "==> [2/5] Clonando o repositório skill-scanner..."
git clone https://github.com/cisco-ai-defense/skill-scanner

echo "==> [3/5] Construindo o skill-scanner..."
cd skill-scanner
uv sync --all-extras
SCANNER="$(pwd)/.venv/bin/skill-scanner"
cd "$BASE_DIR"

echo "==> [4/5] Descobrindo skills em '$SKILLS_DIR'..."
SKILLS="$(
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d \
    ! -name references ! -name scripts ! -name assets \
    | sort \
    | while read -r dir; do
        [ -f "$dir/SKILL.md" ] && echo "$dir"
      done
)"

if [ -z "$SKILLS" ]; then
  echo "❌ Nenhuma skill encontrada em '$SKILLS_DIR'." >&2
  exit 1
fi

echo "Skills a analisar:"
echo "$SKILLS"

echo "==> [5/5] Executando skill-scanner scan-all por skill (paralelismo=$PARALLELISM)..."
# xargs -P não propaga o status de um worker que falha; capturamos o status
# agregado explicitamente para que qualquer falha individual derrube o job.
set +e
printf '%s\n' "$SKILLS" \
  | xargs -d '\n' -I{} -P "$PARALLELISM" bash -c '
      SKILL_DIR="$1"
      echo "Scanning skill: $SKILL_DIR"
      "'"$SCANNER"'" scan-all "$SKILL_DIR"
    ' _ {}
status=$?
set -e

if [ "$status" -ne 0 ]; then
  echo "❌ Falha no scan de segurança (status do xargs: $status)." >&2
  exit "$status"
fi

echo "✅ Scan de segurança concluído com sucesso!"
