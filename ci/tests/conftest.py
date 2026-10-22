"""Configuração compartilhada dos testes do validador do pacote."""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

TESTS_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = TESTS_DIR.parent / "scripts"
REPO_ROOT = TESTS_DIR.parents[1]

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

import validate_package  # noqa: E402


@pytest.fixture
def fixtures_dir() -> Path:
    return TESTS_DIR / "fixtures"


@pytest.fixture
def repo_root() -> Path:
    return REPO_ROOT


@pytest.fixture
def run(capsys):
    """Executa ``validate_package.main`` e devolve ``(exit_code, stdout)``."""

    def _run(root: Path | str, only: list[str] | None = None) -> tuple[int, str]:
        argv = [str(root)]
        if only:
            argv += ["--only", *only]
        code = validate_package.main(argv)
        return code, capsys.readouterr().out

    return _run
