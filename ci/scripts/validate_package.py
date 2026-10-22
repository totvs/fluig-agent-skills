#!/usr/bin/env python3
"""Validador estático do pacote fluig-agent-skills (somente stdlib).

Uso:
    python ci/scripts/validate_package.py [ROOT] [--root DIR] [--only IDS...] [--list-checks]

- ROOT/--root: raiz do pacote (padrão: dois níveis acima deste script).
- --only: executa só os checks indicados (separados por espaço e/ou vírgula,
  sem diferenciar maiúsculas; aceita o código ou o apelido curto).
- --list-checks: lista os checks registrados e sai.

Cada achado é impresso como ``path/relativo:linha: [CHECK] mensagem``.
Exit 0 sem achados, 1 com achados, 2 para erro de uso.

Novos checks são adicionados com o decorator ``@check("CODIGO", "apelido")``
sobre uma função ``(pkg: Package) -> Iterable[Finding]``.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Iterable, Iterator
from urllib.parse import unquote

DEFAULT_ROOT = Path(__file__).resolve().parents[2]

# Diretórios ignorados quando estão no primeiro nível da raiz varrida.
EXCLUDED_TOP_DIRS = frozenset(
    {"fluig-agent-skills", ".kiro", ".venv", ".git", ".agents", "node_modules", "release"}
)
# Diretórios ignorados em qualquer nível.
EXCLUDED_ANY_DIRS = frozenset({".git", "node_modules", "__pycache__", ".pytest_cache"})
# Prefixos relativos (posix) ignorados — fixtures só são varridas quando passadas como raiz.
EXCLUDED_REL_PREFIXES = ("ci/tests/fixtures",)

# Diretórios do pacote cujos .md têm os links validados (além dos .md da raiz).
MD_DIRS = ("skills", "context", "examples", "docs")

# Exceção à exclusão de `.kiro` (decisão [3]=a): `.kiro/specs/**` entra na
# varredura de `.md`, SEMPRE excluindo a spec desta própria refatoração. O resto
# de `.kiro/` continua excluído por EXCLUDED_TOP_DIRS.
KIRO_SPECS_PREFIX = ".kiro/specs"
KIRO_SPECS_EXCLUDED = (".kiro/specs/refactor-maven-store",)

# Arquivos da camada Store (persona Parceiro) em context/. Fonte única desses
# nomes no CI: os checks e os testes (ci/tests) usam estas constantes em vez
# de repetir o literal.
STORE_ARCH_FILE = "partner-store-architecture.md"
STORE_CONV_FILE = "partner-store-conventions.md"
STORE_REVIEW_FILE = "partner-store-review-rules.md"


# --------------------------------------------------------------------------- #
# Modelo
# --------------------------------------------------------------------------- #
@dataclass(frozen=True, order=True)
class Finding:
    path: str
    line: int
    check: str
    message: str

    def __str__(self) -> str:
        return f"{self.path}:{self.line}: [{self.check}] {self.message}"


@dataclass
class Check:
    code: str
    func: Callable[["Package"], Iterable[Finding]]
    aliases: tuple[str, ...] = field(default_factory=tuple)


CHECKS: dict[str, Check] = {}


def check(code: str, *aliases: str):
    """Registra uma função de check sob ``code`` (e apelidos opcionais)."""

    def decorator(func: Callable[["Package"], Iterable[Finding]]):
        CHECKS[code] = Check(code=code, func=func, aliases=tuple(aliases))
        return func

    return decorator


class Package:
    """Acesso de leitura à árvore do pacote, já aplicando as exclusões."""

    def __init__(self, root: Path):
        self.root = Path(root).resolve()
        self._registry_cache: tuple[dict | None, str | None] | None = None

    # -- caminhos ---------------------------------------------------------- #
    def rel(self, path: Path) -> str:
        try:
            return Path(path).resolve().relative_to(self.root).as_posix()
        except ValueError:
            return Path(path).as_posix()

    def is_excluded(self, path: Path) -> bool:
        rel = self.rel(path)
        parts = rel.split("/")
        if any(p in EXCLUDED_ANY_DIRS for p in parts):
            return True
        if self._in_scanned_kiro_specs(rel):
            # Exceção [3]=a: `.kiro/specs/**` é varrido, menos a spec da refatoração.
            return False
        if parts and parts[0] in EXCLUDED_TOP_DIRS:
            return True
        return any(rel == p or rel.startswith(p + "/") for p in EXCLUDED_REL_PREFIXES)

    @staticmethod
    def _in_scanned_kiro_specs(rel: str) -> bool:
        """``True`` se ``rel`` está sob `.kiro/specs/` e fora da spec da refatoração."""
        if not (rel == KIRO_SPECS_PREFIX or rel.startswith(KIRO_SPECS_PREFIX + "/")):
            return False
        return not any(rel == e or rel.startswith(e + "/") for e in KIRO_SPECS_EXCLUDED)

    def read_text(self, path: Path) -> str:
        return Path(path).read_text(encoding="utf-8", errors="replace")

    def iter_files(self, *subdirs: str, suffixes: Iterable[str] | None = None) -> Iterator[Path]:
        """Arquivos sob ``subdirs`` (ou sob a raiz inteira), ordenados, sem os excluídos."""
        sfx = tuple(s.lower() for s in suffixes) if suffixes else None
        bases = [self.root / s for s in subdirs] if subdirs else [self.root]
        for base in bases:
            if not base.is_dir() or (base != self.root and self.is_excluded(base)):
                continue
            for dirpath, dirnames, filenames in os.walk(base):
                current = Path(dirpath)
                dirnames[:] = sorted(d for d in dirnames if not self.is_excluded(current / d))
                for name in sorted(filenames):
                    p = current / name
                    if sfx and not name.lower().endswith(sfx):
                        continue
                    if not self.is_excluded(p):
                        yield p

    def md_files(self) -> list[Path]:
        """.md de skills/, context/, examples/, docs/, da raiz e de `.kiro/specs`."""
        files = sorted(p for p in self.root.glob("*.md") if p.is_file())
        files.extend(self.iter_files(*MD_DIRS, suffixes=[".md"]))
        files.extend(self.kiro_specs_md_files())
        return files

    def kiro_specs_md_files(self) -> list[Path]:
        """.md de `.kiro/specs/**`, menos `.kiro/specs/refactor-maven-store/`.

        A exclusão global de `.kiro` é contornada por ``is_excluded`` (exceção
        [3]=a); aqui a varredura é feita diretamente sob `.kiro/specs`.
        """
        base = self.root / KIRO_SPECS_PREFIX
        if not base.is_dir():
            return []
        out: list[Path] = []
        for dirpath, dirnames, filenames in os.walk(base):
            current = Path(dirpath)
            dirnames[:] = sorted(d for d in dirnames if not self.is_excluded(current / d))
            for name in sorted(filenames):
                p = current / name
                if name.lower().endswith(".md") and not self.is_excluded(p):
                    out.append(p)
        return out

    def skill_dirs(self) -> list[Path]:
        skills = self.root / "skills"
        if not skills.is_dir():
            return []
        return sorted(p for p in skills.iterdir() if p.is_dir() and not self.is_excluded(p))

    def registry(self) -> tuple[dict | None, str | None]:
        """Retorna ``(dados, erro)`` de ``skills-registry.json``."""
        if self._registry_cache is None:
            path = self.root / "skills-registry.json"
            if not path.is_file():
                self._registry_cache = (None, "skills-registry.json ausente")
            else:
                try:
                    data = json.loads(self.read_text(path))
                except json.JSONDecodeError as exc:
                    self._registry_cache = (None, f"JSON inválido: {exc.msg} (linha {exc.lineno})")
                else:
                    self._registry_cache = (data, None)
        return self._registry_cache


# --------------------------------------------------------------------------- #
# Utilitários de parsing (também usados por checks futuros)
# --------------------------------------------------------------------------- #
_FM_KEY_RE = re.compile(r"^([A-Za-z0-9_-]+)\s*:\s*(.*)$")
_BLOCK_SCALARS = {">", ">-", ">+", "|", "|-", "|+"}


def _unquote_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
        inner = value[1:-1]
        return inner.replace("''", "'") if value[0] == "'" else inner.replace('\\"', '"')
    return value


def parse_frontmatter(text: str) -> tuple[dict[str, str], int] | None:
    """Parse simples de frontmatter YAML entre ``---``.

    Suporta ``chave: valor``, valores entre aspas e escalares de bloco
    (``>``, ``>-``, ``|``, ``|-``) com linhas de continuação indentadas.
    Retorna ``(dados, linha_do_fechamento)`` ou ``None`` se não houver
    frontmatter bem formado.
    """
    lines = text.lstrip("\ufeff").splitlines()
    if not lines or lines[0].strip() != "---":
        return None
    data: dict[str, str] = {}
    key: str | None = None
    style: str | None = None
    buf: list[str] = []

    def flush() -> None:
        nonlocal key, style, buf
        if key is not None and style is not None:
            parts = [b.strip() for b in buf]
            if style.startswith("|"):
                data[key] = "\n".join(parts).strip()
            else:
                data[key] = " ".join(p for p in parts if p).strip()
        key, style, buf = None, None, []

    for idx, raw in enumerate(lines[1:], start=2):
        if raw.strip() == "---":
            flush()
            return data, idx
        if style is not None and (raw.startswith((" ", "\t")) or not raw.strip()):
            buf.append(raw)
            continue
        flush()
        m = _FM_KEY_RE.match(raw)
        if not m:
            continue
        k, v = m.group(1), m.group(2).strip()
        if v in _BLOCK_SCALARS:
            key, style = k, v
        else:
            data[k] = _unquote_scalar(v)
    return None


_FENCE_RE = re.compile(r"^\s{0,3}(`{3,}|~{3,})\s*([\w+#.-]*)")
_INLINE_CODE_RE = re.compile(r"(`+)(.+?)\1")
_INLINE_LINK_RE = re.compile(r"!?\[(?:[^\[\]]|\[[^\]]*\])*\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+(?:\"[^\"]*\"|'[^']*'))?\s*\)")
_REF_DEF_RE = re.compile(r"^\s{0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)")


def _iter_non_fenced_lines(text: str) -> Iterator[tuple[int, str]]:
    fence: str | None = None
    for no, line in enumerate(text.splitlines(), start=1):
        m = _FENCE_RE.match(line)
        if fence is None:
            if m:
                fence = m.group(1)
                continue
            yield no, line
        elif m and m.group(1)[0] == fence[0] and len(m.group(1)) >= len(fence) and not m.group(2):
            fence = None


def iter_md_links(text: str) -> Iterator[tuple[int, str]]:
    """Gera ``(linha, alvo)`` de links Markdown fora de cercas e de código inline."""
    for no, line in _iter_non_fenced_lines(text):
        clean = _INLINE_CODE_RE.sub(lambda m: " " * len(m.group(0)), line)
        for m in _INLINE_LINK_RE.finditer(clean):
            yield no, m.group(1).strip("<>")
        m = _REF_DEF_RE.match(clean)
        if m:
            yield no, m.group(1).strip("<>")


_LABELED_LINK_RE = re.compile(
    r"!?\[((?:[^\[\]]|\[[^\]]*\])*)\]\(\s*(<[^>]*>|[^)\s]+)(?:\s+(?:\"[^\"]*\"|'[^']*'))?\s*\)"
)


def iter_md_links_labeled(text: str) -> Iterator[tuple[int, str, str]]:
    """Gera ``(linha, rótulo, alvo)`` de links Markdown inline (fora de cercas e
    de código inline). Links de referência (``[a]: b``) não têm rótulo útil para
    os checks de seção e são ignorados aqui."""
    for no, line in _iter_non_fenced_lines(text):
        clean = _INLINE_CODE_RE.sub(lambda m: " " * len(m.group(0)), line)
        for m in _LABELED_LINK_RE.finditer(clean):
            yield no, m.group(1), m.group(2).strip("<>")


@dataclass(frozen=True)
class CodeBlock:
    lang: str
    start_line: int  # linha da primeira linha de conteúdo (após a cerca)
    lines: tuple[str, ...]


def iter_code_blocks(text: str) -> Iterator[CodeBlock]:
    """Gera os blocos cercados (``` / ~~~) de um Markdown com linguagem e linha inicial."""
    fence: str | None = None
    lang = ""
    start = 0
    buf: list[str] = []
    for no, line in enumerate(text.splitlines(), start=1):
        m = _FENCE_RE.match(line)
        if fence is None:
            if m:
                fence, lang, start, buf = m.group(1), m.group(2).lower(), no + 1, []
        elif m and m.group(1)[0] == fence[0] and len(m.group(1)) >= len(fence) and not m.group(2):
            yield CodeBlock(lang=lang, start_line=start, lines=tuple(buf))
            fence = None
        else:
            buf.append(line)
    if fence is not None:
        yield CodeBlock(lang=lang, start_line=start, lines=tuple(buf))


def github_slug(heading: str) -> str:
    """Slug de âncora no estilo GitHub (minúsculas, sem pontuação exceto ``-``)."""
    text = re.sub(r"<[^>]+>", "", heading).strip().lower()
    text = re.sub(r"[^\w\- ]", "", text)
    return text.replace(" ", "-")


def strip_js_noise(code: str, keep_strings: bool = False) -> str:
    """Remove comentários (e, por padrão, o conteúdo de strings) de código JS.

    Preserva quebras de linha para manter a numeração. Strings viram ``""``
    (ou ficam intactas com ``keep_strings=True``). Template literals são
    tratados como string inteira (sem análise de ``${...}``).
    """
    out: list[str] = []
    i, n = 0, len(code)
    while i < n:
        c = code[i]
        nxt = code[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            j = code.find("\n", i)
            j = n if j == -1 else j
            i = j
            continue
        if c == "/" and nxt == "*":
            j = code.find("*/", i + 2)
            j = n if j == -1 else j + 2
            out.append("\n" * code.count("\n", i, j))
            i = j
            continue
        if c in ("'", '"', "`"):
            j = i + 1
            while j < n and code[j] != c:
                if code[j] == "\\":
                    j += 1
                elif code[j] == "\n" and c != "`":
                    break
                j += 1
            j = min(j + 1, n)
            if keep_strings:
                out.append(code[i:j])
            else:
                out.append(c + "\n" * code.count("\n", i, j) + c)
            i = j
            continue
        out.append(c)
        i += 1
    return "".join(out)


def _line_of(text: str, needle: str, default: int = 1) -> int:
    idx = text.find(needle)
    return text.count("\n", 0, idx) + 1 if idx >= 0 else default


# --------------------------------------------------------------------------- #
# Checks
# --------------------------------------------------------------------------- #
@check("SKILL_FRONTMATTER", "frontmatter")
def check_skill_frontmatter(pkg: Package) -> Iterator[Finding]:
    code = "SKILL_FRONTMATTER"
    for skill_dir in pkg.skill_dirs():
        skill_md = skill_dir / "SKILL.md"
        if not skill_md.is_file():
            yield Finding(pkg.rel(skill_dir), 1, code, "pasta de skill sem SKILL.md")
            continue
        parsed = parse_frontmatter(pkg.read_text(skill_md))
        rel = pkg.rel(skill_md)
        if parsed is None:
            yield Finding(rel, 1, code, "frontmatter YAML ausente ou não fechado com '---'")
            continue
        data, _ = parsed
        name = data.get("name", "")
        if name != skill_dir.name:
            yield Finding(rel, 1, code, f"name '{name}' difere do nome da pasta '{skill_dir.name}'")
        if not data.get("description", "").strip():
            yield Finding(rel, 1, code, "description ausente ou vazia")


@check("REGISTRY", "registry")
def check_registry(pkg: Package) -> Iterator[Finding]:
    code = "REGISTRY"
    reg_rel = "skills-registry.json"
    data, error = pkg.registry()
    if error:
        yield Finding(reg_rel, 1, code, error)
        return
    reg_text = pkg.read_text(pkg.root / reg_rel)
    skills = data.get("skills") if isinstance(data, dict) else None
    if not isinstance(skills, list):
        yield Finding(reg_rel, 1, code, "campo 'skills' ausente ou não é uma lista")
        return

    seen: set[str] = set()
    cursor = 0  # as entradas aparecem em ordem: busca a próxima ocorrência do name
    for idx, entry in enumerate(skills):
        if not isinstance(entry, dict) or not isinstance(entry.get("name"), str):
            yield Finding(reg_rel, 1, code, f"skills[{idx}] sem 'name' textual")
            continue
        name = entry["name"]
        pos = reg_text.find(f'"name": "{name}"', cursor)
        if pos >= 0:
            cursor = pos + 1
            line = reg_text.count("\n", 0, pos) + 1
        else:
            line = _line_of(reg_text, f'"{name}"')
        if name in seen:
            yield Finding(reg_rel, line, code, f"skill '{name}' duplicada no registry")
        seen.add(name)

        path = entry.get("path")
        if not isinstance(path, str) or not path:
            yield Finding(reg_rel, line, code, f"skill '{name}' sem 'path'")
            continue
        skill_path = pkg.root / path
        if not skill_path.is_dir():
            yield Finding(reg_rel, line, code, f"path '{path}' da skill '{name}' não existe")
            continue
        if Path(path).name != name:
            yield Finding(reg_rel, line, code, f"path '{path}' não termina no name '{name}'")
        for f in entry.get("files") or []:
            if not (skill_path / f).is_file():
                yield Finding(reg_rel, line, code, f"arquivo '{path}/{f}' da skill '{name}' não existe")

    for skill_dir in pkg.skill_dirs():
        if skill_dir.name not in seen:
            yield Finding(pkg.rel(skill_dir), 1, code, f"skill '{skill_dir.name}' ausente do skills-registry.json")


_SCHEME_RE = re.compile(r"^[A-Za-z][A-Za-z0-9+.-]*:")
_HEADING_RE = re.compile(r"^(#{1,6})\s+(.+?)\s*$")


def _heading_slugs(text: str) -> set[str]:
    """Slugs de âncora (estilo GitHub) de todos os cabeçalhos de um Markdown.

    Reproduz o desambiguador de duplicatas do GitHub: a 1ª ocorrência de um
    slug fica como está; as seguintes recebem o sufixo ``-1``, ``-2``, ...
    """
    seen: dict[str, int] = {}
    slugs: set[str] = set()
    for _, line in _iter_non_fenced_lines(text):
        m = _HEADING_RE.match(line)
        if not m:
            continue
        base = github_slug(m.group(2))
        n = seen.get(base, 0)
        slugs.add(base if n == 0 else f"{base}-{n}")
        seen[base] = n + 1
    return slugs


# Número de seção no início de um cabeçalho: `§ 21.4`, `21.4`, `21.`, `§4`.
_HEADING_NUMBER_RE = re.compile(r"^\s*(?:§\s*)?(\d+(?:\.\d+)*)(?=[.):\s]|$)")
# Número de um rótulo de link de seção: `§ 2`, `§ 21.4`, `§§ 11`.
_LABEL_SECTION_RE = re.compile(r"§{1,2}\s*(\d+(?:\.\d+)*)")


def _heading_number(heading: str) -> str | None:
    """Número de seção no início de um cabeçalho (ex.: ``21.4``), ou ``None``."""
    m = _HEADING_NUMBER_RE.match(heading)
    return m.group(1) if m else None


def _heading_numbers_by_slug(text: str) -> dict[str, str]:
    """Mapa ``slug -> número de seção`` dos cabeçalhos que começam com número.

    Usa a mesma desambiguação de slug do GitHub (``-1``, ``-2``). Cabeçalhos
    sem número de seção não entram no mapa.
    """
    seen: dict[str, int] = {}
    result: dict[str, str] = {}
    for _, line in _iter_non_fenced_lines(text):
        m = _HEADING_RE.match(line)
        if not m:
            continue
        base = github_slug(m.group(2))
        n = seen.get(base, 0)
        slug = base if n == 0 else f"{base}-{n}"
        seen[base] = n + 1
        number = _heading_number(m.group(2))
        if number is not None:
            result[slug] = number
    return result


@check("LINKS", "links")
def check_links(pkg: Package) -> Iterator[Finding]:
    code = "LINKS"
    heading_cache: dict[Path, set[str]] = {}

    def headings_of(path: Path) -> set[str]:
        if path not in heading_cache:
            heading_cache[path] = _heading_slugs(pkg.read_text(path)) if path.is_file() else set()
        return heading_cache[path]

    for md in pkg.md_files():
        rel = pkg.rel(md)
        for line, target in iter_md_links(pkg.read_text(md)):
            if not target or _SCHEME_RE.match(target):
                continue
            base, _, frag_part = target.partition("#")
            fragment = unquote(frag_part.split("?")[0]) if frag_part else ""
            if target.startswith("#"):
                if fragment and fragment not in headings_of(md):
                    yield Finding(rel, line, code, f"âncora '#{fragment}' não encontrada em '{md.name}'")
                continue
            clean = unquote(base.split("?")[0])
            if not clean:
                continue
            resolved = pkg.root / clean.lstrip("/") if clean.startswith("/") else md.parent / clean
            if not resolved.exists():
                yield Finding(rel, line, code, f"link relativo quebrado: '{target}'")
                continue
            if fragment and resolved.suffix.lower() == ".md" and fragment not in headings_of(resolved):
                yield Finding(rel, line, code, f"âncora '#{fragment}' não encontrada em '{resolved.name}'")


# --------------------------------------------------------------------------- #
# Checks de referência a seção (Task 3).
#
# Formato dos links (spec §4.7): toda citação de seção vira link com âncora
# real. SECTION_REFS barra o link `§ N` sem âncora; SECTION_LINK_LABEL barra o
# `§ N(.M)` cujo número difere do cabeçalho de destino. PLAIN_SECTION_REFS e
# CODE_ANCHOR_REFS ficam implementados mas desligados no repositório (só rodam
# quando pedidos por `--only`, cf. DISABLED_IN_REPO). RETIRED_FILES nasce com a
# lista vazia (preenchida na Task 8).
# --------------------------------------------------------------------------- #

# Checks implementados mas desligados na varredura padrão do repositório. Ainda
# aparecem em --list-checks e rodam quando selecionados explicitamente por
# --only. Vazio desde a Task 8: PLAIN_SECTION_REFS e CODE_ANCHOR_REFS passaram a
# rodar na varredura padrão (ligados no repositório).
DISABLED_IN_REPO: frozenset[str] = frozenset()

# Arquivos aposentados (Task 8): os 4 arquivos da camada antiga de parceiro,
# cujo conteúdo migrou para backend-java-maven.md, conventions.md,
# architecture.md e os partner-store-*. Nenhum arquivo varrido pode voltar a
# citá-los. Escopo em check_retired_files.
RETIRED_FILES: tuple[str, ...] = (
    "partner-architecture.md",
    "partner-conventions.md",
    "partner-technologies.md",
    "partner-review-rules.md",
)


def _frag_of(target: str) -> tuple[str, str]:
    """Separa ``alvo`` em ``(base, fragmento)`` com o fragmento já desescapado."""
    base, _, frag_part = target.partition("#")
    fragment = unquote(frag_part.split("?")[0]) if frag_part else ""
    return unquote(base.split("?")[0]), fragment


@check("SECTION_REFS", "section-refs")
def check_section_refs(pkg: Package) -> Iterator[Finding]:
    """Link cujo rótulo cita uma seção (`§ N`) mas o alvo não tem âncora."""
    code = "SECTION_REFS"
    for md in pkg.md_files():
        rel = pkg.rel(md)
        for line, label, target in iter_md_links_labeled(pkg.read_text(md)):
            if not _LABEL_SECTION_RE.search(label):
                continue
            if _SCHEME_RE.match(target):
                continue
            _, fragment = _frag_of(target)
            if not fragment:
                yield Finding(
                    rel, line, code,
                    f"citação de seção em link sem âncora: rótulo '{label.strip()}' "
                    f"aponta para '{target}' (use '#slug')",
                )


@check("SECTION_LINK_LABEL", "section-label")
def check_section_link_label(pkg: Package) -> Iterator[Finding]:
    """Número do rótulo `§ N(.M)` difere do número do cabeçalho de destino."""
    code = "SECTION_LINK_LABEL"
    number_cache: dict[Path, dict[str, str]] = {}

    def numbers_of(path: Path) -> dict[str, str]:
        if path not in number_cache:
            number_cache[path] = (
                _heading_numbers_by_slug(pkg.read_text(path)) if path.is_file() else {}
            )
        return number_cache[path]

    for md in pkg.md_files():
        rel = pkg.rel(md)
        for line, label, target in iter_md_links_labeled(pkg.read_text(md)):
            m = _LABEL_SECTION_RE.search(label)
            if not m or _SCHEME_RE.match(target):
                continue
            base, fragment = _frag_of(target)
            if not fragment:
                continue  # sem âncora é problema do SECTION_REFS, não daqui
            if target.startswith("#"):
                resolved = md
            else:
                if not base:
                    continue
                resolved = pkg.root / base.lstrip("/") if base.startswith("/") else md.parent / base
            if resolved.suffix.lower() != ".md" or not resolved.is_file():
                continue
            heading_number = numbers_of(resolved).get(fragment)
            if heading_number is None:
                continue  # cabeçalho de destino sem número: nada a comparar
            label_number = m.group(1)
            if label_number != heading_number:
                yield Finding(
                    rel, line, code,
                    f"rótulo '§ {label_number}' não bate com o número do cabeçalho de "
                    f"destino ('§ {heading_number}' em '{resolved.name}#{fragment}')",
                )


# Texto puro: `§ N`, `§§ N` ou "seção/seções N" fora de link e de código inline.
_PLAIN_SECTION_RE = re.compile(
    r"§{1,2}\s*\d+(?:\.\d+)*|\bseç(?:ão|ões)\s+\d+(?:\.\d+)*",
    re.IGNORECASE,
)


def _mask_links(line: str) -> str:
    """Substitui links Markdown por espaços, preservando o comprimento."""
    return _LABELED_LINK_RE.sub(lambda m: " " * len(m.group(0)), line)


@check("PLAIN_SECTION_REFS", "plain-section-refs", "plain-section")
def check_plain_section_refs(pkg: Package) -> Iterator[Finding]:
    """`§ N`, `§§` ou "seção N" em texto puro, fora de link e de código.

    Desligado na varredura padrão do repositório (DISABLED_IN_REPO): lista o
    backlog de citações de seção que ainda não viraram link com âncora. Rode
    com ``--only plain-section-refs`` para ver o backlog.
    """
    code = "PLAIN_SECTION_REFS"
    for md in pkg.md_files():
        rel = pkg.rel(md)
        for no, line in _iter_non_fenced_lines(pkg.read_text(md)):
            clean = _INLINE_CODE_RE.sub(lambda m: " " * len(m.group(0)), line)
            clean = _mask_links(clean)
            for m in _PLAIN_SECTION_RE.finditer(clean):
                yield Finding(
                    rel, no, code,
                    f"citação de seção em texto puro (deve virar link com âncora): "
                    f"'{m.group(0).strip()}'",
                )


# Em comentários de código de examples/, referência a context/*.md.
_CODE_CONTEXT_REF_RE = re.compile(r"context/[\w./-]*\.md(#[^\s)\"']*)?", re.IGNORECASE)
_CODE_LOOSE_SECTION_RE = re.compile(r"§{1,2}")
_CODE_COMMENT_EXTS = (".js", ".java", ".ts", ".properties")


@check("CODE_ANCHOR_REFS", "code-anchor-refs", "code-anchor")
def check_code_anchor_refs(pkg: Package) -> Iterator[Finding]:
    """Em comentários de código de ``examples/``, referência a ``context/*.md``
    sem ``#slug`` válido, ou com ``§`` solto.

    Desligado na varredura padrão do repositório (DISABLED_IN_REPO).
    """
    code = "CODE_ANCHOR_REFS"
    slug_cache: dict[Path, set[str]] = {}

    def slugs_of(path: Path) -> set[str]:
        if path not in slug_cache:
            slug_cache[path] = _heading_slugs(pkg.read_text(path)) if path.is_file() else set()
        return slug_cache[path]

    for src in pkg.iter_files("examples", suffixes=list(_CODE_COMMENT_EXTS)):
        rel = pkg.rel(src)
        text = pkg.read_text(src)
        # Só comentários: remove o conteúdo de código, deixando os comentários.
        # strip_js_noise remove comentários; aqui o inverso é mais simples pela
        # heurística de linha — varremos linha a linha procurando // ou * ou #.
        for no, raw in enumerate(text.splitlines(), start=1):
            stripped = raw.strip()
            is_comment = (
                stripped.startswith("//")
                or stripped.startswith("*")
                or stripped.startswith("/*")
                or (src.suffix.lower() == ".properties" and stripped.startswith("#"))
            )
            if not is_comment:
                continue
            for m in _CODE_CONTEXT_REF_RE.finditer(raw):
                frag = m.group(1)
                if not frag or len(frag) <= 1:
                    yield Finding(
                        rel, no, code,
                        f"referência a context/*.md sem âncora em comentário: '{m.group(0)}'",
                    )
                    continue
                fragment = unquote(frag[1:])
                base = m.group(0).split("#", 1)[0]
                target = (pkg.root / base) if base.startswith("context/") else (src.parent / base)
                if target.is_file() and fragment not in slugs_of(target):
                    yield Finding(
                        rel, no, code,
                        f"âncora '#{fragment}' não encontrada em '{target.name}' (comentário)",
                    )
            if _CODE_LOOSE_SECTION_RE.search(raw):
                yield Finding(
                    rel, no, code,
                    "'§' solto em comentário de código — use o caminho 'context/arquivo.md#slug'",
                )


@check("RETIRED_FILES", "retired-files", "retired")
def check_retired_files(pkg: Package) -> Iterator[Finding]:
    """Nome de arquivo aposentado (RETIRED_FILES) citado num arquivo varrido.

    A lista nasce vazia (Task 3) e é preenchida na Task 8. Escopo: skills/,
    context/, examples/, docs/, os .md da raiz e `.kiro/specs` (menos a spec da
    refatoração). ``ci/`` fica fora (o próprio validador guarda esses nomes).
    """
    code = "RETIRED_FILES"
    if not RETIRED_FILES:
        return
    pattern = re.compile(
        r"(?<![\w-])(" + "|".join(re.escape(n) for n in RETIRED_FILES) + r")(?![\w-])"
    )
    files = sorted(p for p in pkg.root.glob("*.md") if p.is_file())
    files.extend(pkg.iter_files(*MD_DIRS, suffixes=[".md"]))
    files.extend(pkg.kiro_specs_md_files())
    for path in sorted(set(files)):
        rel = pkg.rel(path)
        for no, line in enumerate(pkg.read_text(path).splitlines(), start=1):
            for m in pattern.finditer(line):
                yield Finding(rel, no, code, f"nome de arquivo aposentado: '{m.group(1)}'")


# --------------------------------------------------------------------------- #
# CONSTITUTION — regras da platform-constitution.md (D3)
# --------------------------------------------------------------------------- #
_EXTEND_OPEN_RE = re.compile(r"\.extend\s*\(\s*\{")
_SHORTHAND_RE = re.compile(
    r"^\s*(?!(?:if|for|while|switch|catch|function|else|do|try|finally)\b)"
    r"[A-Za-z_$][\w$]*\s*\([^()]*\)\s*\{"
)
_ARROW_METHOD_RE = re.compile(r"[A-Za-z_$][\w$]*\s*:\s*(?:async\s*)?\([^()]*\)\s*=>")
_ASYNC_FALSE_RE = re.compile(r"\basync\s*:\s*false\b")
_I18N_INVENTED_RE = re.compile(r"\[=\s*i18n\b")
_APP_VERSION_RE = re.compile(r"\bapplication\.version\b")


def _line_start_depths(code: str) -> list[int]:
    """Profundidade de chaves ``{``/``}`` no início de cada linha (0-based)."""
    depths = []
    depth = 0
    for line in code.split("\n"):
        depths.append(depth)
        depth += line.count("{") - line.count("}")
    return depths


def _extend_member_lines(code: str) -> set[int]:
    """Linhas (1-based) que são propriedades diretas de um objeto ``.extend({...})``."""
    depths = _line_start_depths(code)
    members: set[int] = set()
    for m in _EXTEND_OPEN_RE.finditer(code):
        start_line_idx = code.count("\n", 0, m.start())
        target_depth = depths[start_line_idx] + 1
        for i in range(start_line_idx + 1, len(depths)):
            if depths[i] < target_depth:
                break
            if depths[i] == target_depth:
                members.add(i + 1)
    return members


def _correct_lines(lines: tuple[str, ...]) -> set[int]:
    """Linhas (1-based) dentro de uma região ``✅`` (D3), encerrada por ``❌``/``⚠️``."""
    result: set[int] = set()
    in_region = False
    for i, line in enumerate(lines, start=1):
        if "✅" in line:
            in_region = True
        if "❌" in line or "⚠️" in line:
            in_region = False
            continue
        if in_region:
            result.add(i)
    return result


def _scan_js_constitution(lines: tuple[str, ...], restrict: set[int] | None) -> list[tuple[int, str]]:
    """Varre linhas de JS por violações da constituição; retorna ``(linha, msg)`` 1-based."""
    code = "\n".join(lines)
    structural = strip_js_noise(code, keep_strings=False)
    textual = strip_js_noise(code, keep_strings=True)
    struct_lines = structural.split("\n")
    text_lines = textual.split("\n")
    findings: list[tuple[int, str]] = []

    for ln in sorted(_extend_member_lines(structural)):
        if restrict is not None and ln not in restrict:
            continue
        line_text = struct_lines[ln - 1]
        if _SHORTHAND_RE.match(line_text):
            findings.append((ln, "method shorthand ES6 proibido dentro de .extend({}) — use 'nome: function() {}'"))
        if _ARROW_METHOD_RE.search(line_text):
            findings.append((ln, "arrow function como método proibida dentro de .extend({}) — use 'nome: function() {}'"))

    for i, line_text in enumerate(text_lines, start=1):
        if restrict is not None and i not in restrict:
            continue
        if _I18N_INVENTED_RE.search(line_text):
            findings.append((i, "'[=i18n...]' não é sintaxe oficial do Fluig — use '${i18n.getTranslation(...)}' (mesma sintaxe do .ftl)"))
        if _ASYNC_FALSE_RE.search(line_text):
            findings.append((i, "'async: false' é proibido — bloqueia a thread; use fetch() + async/await"))
        if _APP_VERSION_RE.search(line_text):
            findings.append((i, "'application.version' não existe no application.info — não referenciar"))

    return findings


@check("CONSTITUTION", "constitution")
def check_constitution(pkg: Package) -> Iterator[Finding]:
    code = "CONSTITUTION"

    for js in pkg.iter_files("examples", suffixes=[".js"]):
        rel = pkg.rel(js)
        text = pkg.read_text(js)
        for line, msg in _scan_js_constitution(tuple(text.splitlines()), restrict=None):
            yield Finding(rel, line, code, msg)

    for md in pkg.iter_files(*MD_DIRS, suffixes=[".md"]):
        rel = pkg.rel(md)
        text = pkg.read_text(md)
        for block in iter_code_blocks(text):
            if block.lang not in ("javascript", "js"):
                continue
            restrict = _correct_lines(block.lines)
            if not restrict:
                continue
            for line, msg in _scan_js_constitution(block.lines, restrict=restrict):
                yield Finding(rel, block.start_line + line - 1, code, msg)


# --------------------------------------------------------------------------- #
# PERSONA_ROUTER — persona-routing.md existe, linka a constituição e a
# arquitetura de parceiro, e contém o cabeçalho e as 3 opções exatas da
# pergunta de roteamento por destino (Passo 5, cf. spec §1.3).
# --------------------------------------------------------------------------- #
# Cabeçalho exato da pergunta do Passo 5 (spec §1.3).
PERSONA_QUESTION_HEADER = (
    "Para aplicarmos as regras corretas, qual destas opções descreve o destino "
    "deste desenvolvimento?"
)

# As 3 opções exatas de roteamento por destino (spec §1.3). São usadas tanto no
# Passo 1 (ler a conversa) quanto no Passo 5 (perguntar).
PERSONA_OPTIONS: tuple[str, ...] = (
    "Uma solução exclusiva para uma empresa: Sou colaborador, analista ou "
    "consultor e desenvolvo para atender às necessidades dessa empresa. Exemplo: "
    "criar um processo de compras para meu empregador ou cliente.",
    "Um produto para oferecer a diferentes empresas: Sou um parceiro e desenvolvo "
    "ou mantenho uma solução que minha empresa oferece como produto aos clientes. "
    "Exemplo: criar um aplicativo de dashboard para comercialização.",
    "Não tenho certeza: Preciso de ajuda para identificar meu cenário.",
)


@check("PERSONA_ROUTER", "persona")
def check_persona_router(pkg: Package) -> Iterator[Finding]:
    code = "PERSONA_ROUTER"
    rel = "context/persona-routing.md"
    path = pkg.root / rel
    if not path.is_file():
        yield Finding(rel, 1, code, "context/persona-routing.md ausente")
        return
    text = pkg.read_text(path)
    targets = {target for _, target in iter_md_links(text)}
    clean_targets = {unquote(re.split(r"[#?]", t, maxsplit=1)[0]) for t in targets}
    if not any(t.endswith("platform-constitution.md") for t in clean_targets):
        yield Finding(rel, 1, code, "não linka platform-constitution.md")
    if not any(t.endswith(STORE_ARCH_FILE) for t in clean_targets):
        yield Finding(rel, 1, code, f"não linka {STORE_ARCH_FILE}")
    unquoted = "\n".join(re.sub(r"^\s{0,3}>\s?", "", line) for line in text.splitlines())
    normalized = " ".join(unquoted.split())
    if PERSONA_QUESTION_HEADER not in normalized:
        yield Finding(rel, 1, code, "não contém o cabeçalho exato da pergunta do Passo 5 (roteamento por destino)")
    for i, option in enumerate(PERSONA_OPTIONS, start=1):
        if " ".join(option.split()) not in normalized:
            yield Finding(rel, 1, code, f"não contém a opção {i} exata do roteamento por destino")


# --------------------------------------------------------------------------- #
# PARTNER_CALLOUT — nos arquivos do core listados em CORE_FILES, link a
# partner-*.md só é válido dentro do callout "> **Parceiro (Store):**" (D5).
# Arquivo da lista ausente na raiz varrida é ignorado.
# --------------------------------------------------------------------------- #
CORE_FILES = ("architecture.md", "backend-java-maven.md", "conventions.md", "style-guide.md", "technologies.md")
_PARTNER_TARGET_RE = re.compile(r"(?i)\bpartner-[\w-]*\.md\b")
_CALLOUT_START_RE = re.compile(r"^\s{0,3}>\s*\*\*Parceiro \(Store\):\*\*")
_QUOTE_LINE_RE = re.compile(r"^\s{0,3}>")


def _in_partner_callout(lines: list[str], idx: int) -> bool:
    """``True`` se a linha ``idx`` (0-based) pertence a um parágrafo de citação
    contíguo que começa com o callout "> **Parceiro (Store):**"."""
    if not _QUOTE_LINE_RE.match(lines[idx]):
        return False
    start = idx
    while start > 0 and _QUOTE_LINE_RE.match(lines[start - 1]):
        start -= 1
    return bool(_CALLOUT_START_RE.match(lines[start]))


@check("PARTNER_CALLOUT", "callout")
def check_partner_callout(pkg: Package) -> Iterator[Finding]:
    code = "PARTNER_CALLOUT"
    for name in CORE_FILES:
        path = pkg.root / "context" / name
        if not path.is_file():
            continue
        rel = pkg.rel(path)
        text = pkg.read_text(path)
        lines = text.splitlines()
        for lineno, segment in _iter_non_fenced_lines(text):
            clean = _INLINE_CODE_RE.sub(lambda m: " " * len(m.group(0)), segment)
            if not _PARTNER_TARGET_RE.search(clean):
                continue
            if not _in_partner_callout(lines, lineno - 1):
                yield Finding(rel, lineno, code, f"link a partner-*.md fora do callout '> **Parceiro (Store):**': '{segment.strip()}'")


# --------------------------------------------------------------------------- #
# OLD_NAMES — nomes antigos descontinuados (D4). Os nomes oficiais da família de
# review são `fluig-code-review`, `fluig-review-{security,performance,accessibility}`
# e `fluig-best-practices`; continuam proibidos apenas os prefixos legados
# `fluig-pre-review-` e `fluig-code-pre-review`.
# --------------------------------------------------------------------------- #
OLD_NAME_DIRS = ("skills", "context", "examples", "docs", ".github")
_OLD_NAME_RE = re.compile(
    r"(?<![\w-])(fluig-pre-review-|fluig-code-pre-review)"
)
# Nomes antigos das duas skills exclusivas de parceiro (Task 8), renomeadas para
# `fluig-code-review-partner-component`/`fluig-code-review-partner-widgets`.
# Ignora o padrão de nome de arquivo de saída `pre-review-<artefato>-<AAAA-MM-DD>.md`
# (ex.: `pre-review-widget-2025-06-11.md`) — ali `pre-review-widget` é o prefixo do
# arquivo gerado, não o nome da skill. `.kiro/specs/pre-review-*` já é ignorado
# pela exclusão global de `.kiro/` (EXCLUDED_TOP_DIRS).
_OLD_PARTNER_SKILL_RE = re.compile(r"(?<![\w-])pre-review-(component|widget)(?![\w-])")


@check("OLD_NAMES", "old-names", "oldnames")
def check_old_names(pkg: Package) -> Iterator[Finding]:
    code = "OLD_NAMES"
    files = list(pkg.root.glob("*.md"))
    for d in OLD_NAME_DIRS:
        files.extend(pkg.iter_files(d, suffixes=[".md", ".json"]))
    reg = pkg.root / "skills-registry.json"
    if reg.is_file() and reg not in files:
        files.append(reg)
    for path in sorted(set(files)):
        if not path.is_file() or pkg.is_excluded(path):
            continue
        rel = pkg.rel(path)
        for lineno, line in enumerate(pkg.read_text(path).splitlines(), start=1):
            for m in _OLD_NAME_RE.finditer(line):
                yield Finding(rel, lineno, code, f"nome antigo da família de review encontrado: '{m.group(0)}'")
            for m in _OLD_PARTNER_SKILL_RE.finditer(line):
                tail = line[m.end():]
                # Ignora o padrão de arquivo de saída `pre-review-<artefato>-<AAAA-MM-DD>.md`
                # (placeholder literal ou data real) — ali é o nome do arquivo gerado,
                # não o nome de uma skill.
                if re.match(r"-(<AAAA-MM-DD>|\d{4}-\d{2}-\d{2})", tail):
                    continue
                yield Finding(rel, lineno, code, f"nome antigo de skill de parceiro encontrado: '{m.group(0)}'")


# --------------------------------------------------------------------------- #
# ENTRY_FILES — os 5 arquivos de entrada citam os dois ponteiros de persona e
# o conjunto de nomes de skill em AGENTS.md/CLAUDE.md/README.md bate com o registry.
# --------------------------------------------------------------------------- #
ENTRY_FILE_NAMES = ("AGENTS.md", "CLAUDE.md", "copilot-instructions.md", "README.md", "CONTRIBUTING.md")
SKILL_NAME_SET_FILES = ("AGENTS.md", "CLAUDE.md", "README.md")
_SKILL_NAME_RE = re.compile(r"`(fluig-[a-z0-9-]+)`")


@check("ENTRY_FILES", "entry-files", "entry")
def check_entry_files(pkg: Package) -> Iterator[Finding]:
    code = "ENTRY_FILES"
    registry_names: set[str] | None = None
    data, error = pkg.registry()
    if not error and isinstance(data, dict) and isinstance(data.get("skills"), list):
        registry_names = {
            s["name"]
            for s in data["skills"]
            if isinstance(s, dict) and isinstance(s.get("name"), str) and s["name"].startswith("fluig-")
        }

    for name in ENTRY_FILE_NAMES:
        path = pkg.root / name
        if not path.is_file():
            yield Finding(name, 1, code, f"arquivo de entrada ausente: '{name}'")
            continue
        rel = pkg.rel(path)
        text = pkg.read_text(path)
        targets = {unquote(re.split(r"[#?]", t, maxsplit=1)[0]) for _, t in iter_md_links(text)}
        if not any(t.endswith("persona-routing.md") for t in targets):
            yield Finding(rel, 1, code, "não cita context/persona-routing.md")
        if not any(t.endswith("platform-constitution.md") for t in targets):
            yield Finding(rel, 1, code, "não cita context/platform-constitution.md")

        if name in SKILL_NAME_SET_FILES and registry_names is not None:
            found = {m for m in _SKILL_NAME_RE.findall(text) if m.startswith("fluig-")}
            missing = registry_names - found
            extra = found - registry_names
            if missing:
                yield Finding(rel, 1, code, f"skills do registry ausentes da lista: {sorted(missing)}")
            if extra:
                yield Finding(rel, 1, code, f"nomes de skill citados que não existem no registry: {sorted(extra)}")


# --------------------------------------------------------------------------- #
# Execução
# --------------------------------------------------------------------------- #
def resolve_check_ids(ids: Iterable[str]) -> list[str]:
    """Converte códigos/apelidos (sem diferenciar maiúsculas) em códigos registrados."""
    lookup: dict[str, str] = {}
    for c in CHECKS.values():
        lookup[c.code.lower()] = c.code
        for a in c.aliases:
            lookup[a.lower()] = c.code
    resolved: list[str] = []
    for raw in ids:
        for part in str(raw).split(","):
            part = part.strip()
            if not part:
                continue
            code = lookup.get(part.lower())
            if code is None:
                raise KeyError(part)
            if code not in resolved:
                resolved.append(code)
    return resolved


def run_checks(root: Path | str, only: Iterable[str] | None = None) -> list[Finding]:
    pkg = Package(Path(root))
    if only:
        # Seleção explícita (a "flag"): roda exatamente o que foi pedido,
        # inclusive os checks desligados no repositório (DISABLED_IN_REPO).
        codes = resolve_check_ids(only)
    else:
        # Varredura padrão: pula os checks implementados mas desligados.
        codes = [c for c in CHECKS if c not in DISABLED_IN_REPO]
    findings: list[Finding] = []
    for code in codes:
        findings.extend(CHECKS[code].func(pkg))
    return sorted(set(findings))


def main(argv: list[str] | None = None) -> int:
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except (ValueError, OSError):
            pass
    parser = argparse.ArgumentParser(description="Valida a estrutura do pacote fluig-agent-skills.")
    parser.add_argument("root_pos", nargs="?", metavar="ROOT", help="raiz do pacote")
    parser.add_argument("--root", dest="root_opt", metavar="DIR", help="raiz do pacote")
    parser.add_argument("--only", nargs="+", metavar="IDS", help="checks a executar (códigos ou apelidos)")
    parser.add_argument("--list-checks", action="store_true", help="lista os checks registrados")
    args = parser.parse_args(argv)

    if args.list_checks:
        for c in CHECKS.values():
            alias = f" ({', '.join(c.aliases)})" if c.aliases else ""
            print(f"{c.code}{alias}")
        return 0

    root = Path(args.root_opt or args.root_pos or DEFAULT_ROOT)
    if not root.is_dir():
        print(f"erro: raiz '{root}' não é um diretório", file=sys.stderr)
        return 2
    try:
        findings = run_checks(root, args.only)
    except KeyError as exc:
        print(f"erro: check desconhecido {exc}; use --list-checks", file=sys.stderr)
        return 2

    for f in findings:
        print(f)
    if findings:
        print(f"\n{len(findings)} achado(s).")
        return 1
    print("OK: nenhum achado.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
