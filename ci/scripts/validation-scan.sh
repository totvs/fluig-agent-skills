#!/usr/bin/env bash
#
# validation-scan.sh — Validação de estrutura das skills (opcional).
#
# Constrói o validador skills-ref (agentskills/agentskills) e o executa sobre
# cada skill. As skills ficam em nível único (skills/{skill}/SKILL.md).
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

echo "==> [2/5] Clonando o repositório agentskills..."
git clone --depth 1 https://github.com/agentskills/agentskills

echo "==> [3/5] Construindo o skills-ref..."
cd agentskills/skills-ref
uv venv
uv pip install -e .
VALIDATOR="$(pwd)/.venv/bin/skills-ref"
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

echo "Skills a validar:"
echo "$SKILLS"

echo "==> [5/5] Executando skills-ref validate por skill (paralelismo=$PARALLELISM)..."
# xargs -P não propaga o status de um worker que falha; capturamos o status
# agregado explicitamente para que qualquer skill inválida derrube o job.
set +e
printf '%s\n' "$SKILLS" \
  | xargs -d '\n' -I{} -P "$PARALLELISM" bash -c '
      SKILL_DIR="$1"
      echo "Validating skill: $SKILL_DIR"
      "'"$VALIDATOR"'" validate "$SKILL_DIR"
    ' _ {}
status=$?
set -e

if [ "$status" -ne 0 ]; then
  echo "❌ Falha na validação de skills (status do xargs: $status)." >&2
  exit "$status"
fi

echo "✅ Validação de skills concluída com sucesso!"
