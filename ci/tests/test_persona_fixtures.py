"""Homologa a cascata de classificação de persona (context/persona-routing.md)
sobre as fixtures ``ci/tests/fixtures/persona/*``.

O helper ``classify`` implementa — apenas para fins de teste — a mesma cascata
descrita no documento: Passo 2 (marcador de arquivo na raiz), Passo 3 (marcador
técnico de Store: ``component.xml`` em qualquer ponto do projeto, ignorando
``target/``/``node_modules/``/``.git/``, ou consumo de ``/license/api/v1/slots/``
no código) e Passo 4 (estrutura: Studio sem ``pom.xml`` na raiz → Consultor;
Maven sem marcador técnico → Ambíguo/Passo 5). A persona é decidida pelo
**destino**; a estrutura nunca decide Parceiro. Nenhuma skill ou código de
produção depende deste helper.
"""
from __future__ import annotations

from pathlib import Path

import pytest

PARCEIRO = "Parceiro"
CONSULTOR = "Consultor"
AMBIGUO = "Ambiguo"

# Diretórios de build/dependências/VCS ignorados ao procurar o component.xml
# (Passo 3): a presença dentro deles não é marcador técnico de Store.
_IGNORED_DIRS = frozenset({"target", "node_modules", ".git"})

# Marcador técnico de Store no código: consumo da API de validação de slotID.
_SLOTS_API_MARKER = "/license/api/v1/slots/"
# Extensões de arquivo de código varridas em busca do marcador de slot.
_CODE_SUFFIXES = (".js", ".ts", ".java")


def _has_marker(root: Path) -> str | None:
    """Passo 2 — marcador de arquivo na raiz."""
    if (root / ".fluig-partner").exists():
        return PARCEIRO
    if (root / ".fluig-consultant").exists():
        return CONSULTOR
    return None


def _iter_project_files(root: Path):
    """Caminha o projeto a partir de ``root``, podando os diretórios de build,
    dependências e VCS (``target/``, ``node_modules/``, ``.git/``)."""
    import os

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in _IGNORED_DIRS]
        base = Path(dirpath)
        for name in filenames:
            yield base / name


def _has_store_marker(root: Path) -> bool:
    """Passo 3 — marcador técnico de Store (exclusivo): ``component.xml`` em
    qualquer ponto do projeto (fora de ``target/``/``node_modules/``/``.git/``)
    ou consumo de ``/license/api/v1/slots/`` no código."""
    for path in _iter_project_files(root):
        if path.name == "component.xml":
            return True
        if path.suffix.lower() in _CODE_SUFFIXES:
            try:
                if _SLOTS_API_MARKER in path.read_text(encoding="utf-8"):
                    return True
            except (OSError, UnicodeDecodeError):
                continue
    return False


def _find_root_pom(root: Path) -> Path | None:
    pom = root / "pom.xml"
    return pom if pom.is_file() else None


def _is_studio_structure(root: Path) -> bool:
    studio_dirs = ("wcm/widget", "wcm/layout", "forms", "datasets", "workflow")
    return any((root / d).is_dir() for d in studio_dirs)


def classify(root: Path) -> str:
    """Cascata de classificação (Passos 2–5 do documento) sobre ``root``.

    O Passo 1 (destino declarado na conversa) é resolvido fora deste helper —
    aqui só entram os sinais que vivem no sistema de arquivos.
    """
    # Passo 2 — marcador de arquivo vence os Passos 3 e 4.
    marker = _has_marker(root)
    if marker is not None:
        return marker

    # Passo 3 — marcador técnico de Store decide Parceiro de forma exclusiva.
    if _has_store_marker(root):
        return PARCEIRO

    # Passo 4 — estrutura. Sem marcador técnico, a estrutura nunca decide
    # Parceiro: Studio sem pom.xml na raiz → Consultor; Maven ou vazio →
    # Passo 5 (ambíguo até perguntar).
    if _find_root_pom(root) is None and _is_studio_structure(root):
        return CONSULTOR
    return AMBIGUO


@pytest.fixture
def persona_dir(fixtures_dir) -> Path:
    return fixtures_dir / "persona"


@pytest.mark.parametrize(
    "name, expected",
    [
        # Fixtures originais (mantêm o resultado sob a cascata nova).
        ("partner", PARCEIRO),   # tem component.xml (Passo 3)
        ("studio", CONSULTOR),   # Studio sem pom raiz (Passo 4)
        ("empty", AMBIGUO),      # diretório vazio → Passo 5
        ("ambiguous", AMBIGUO),  # Maven sem marcador técnico → Passo 5
        ("marker", CONSULTOR),   # .fluig-consultant vence a estrutura (Passo 2)
        # Fixtures novas (Task 9 — roteamento por destino).
        ("maven-sem-marcador", AMBIGUO),    # pom raiz + EAR, sem component.xml
        ("component-meta-inf", PARCEIRO),   # component.xml em .../META-INF/
        ("slots-api", PARCEIRO),            # consumo de /license/api/v1/slots/
        ("negativos", AMBIGUO),             # component.xml só em README/target/node_modules
        ("maven-consultor", CONSULTOR),     # Maven + .fluig-consultant
    ],
)
def test_classify_fixture(persona_dir, name, expected):
    assert classify(persona_dir / name) == expected
