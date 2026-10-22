"""Testes do validador ``ci/scripts/validate_package.py``."""
from __future__ import annotations

import pytest

import validate_package as vp


def pairs(findings):
    return {(f.path, f.line) for f in findings}


# --------------------------------------------------------------------------- #
# SKILL_FRONTMATTER
# --------------------------------------------------------------------------- #
def test_frontmatter_valid(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "frontmatter" / "valid", only=["frontmatter"]) == []


def test_frontmatter_invalid(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "frontmatter" / "invalid", only=["frontmatter"])
    by_path = {f.path: f.message for f in findings}
    assert set(by_path) == {
        "skills/empty-desc/SKILL.md",
        "skills/missing-skill-md",
        "skills/no-frontmatter/SKILL.md",
        "skills/wrong-name/SKILL.md",
    }
    assert "description" in by_path["skills/empty-desc/SKILL.md"]
    assert "sem SKILL.md" in by_path["skills/missing-skill-md"]
    assert "frontmatter" in by_path["skills/no-frontmatter/SKILL.md"]
    assert "other-name" in by_path["skills/wrong-name/SKILL.md"]
    assert all(f.check == "SKILL_FRONTMATTER" for f in findings)


def test_parse_frontmatter_block_and_quotes():
    text = (
        "---\n"
        "name: \"x\"\n"
        "description: >-\n"
        "  linha um\n"
        "  linha dois\n"
        "hint: 'a ''b'''\n"
        "lit: |\n"
        "  l1\n"
        "  l2\n"
        "---\n"
        "corpo\n"
    )
    data, end = vp.parse_frontmatter(text)
    assert data == {"name": "x", "description": "linha um linha dois", "hint": "a 'b'", "lit": "l1\nl2"}
    assert end == 10
    assert vp.parse_frontmatter("sem frontmatter") is None
    assert vp.parse_frontmatter("---\nname: x\n") is None


# --------------------------------------------------------------------------- #
# REGISTRY
# --------------------------------------------------------------------------- #
def test_registry_valid(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "registry" / "valid", only=["registry"]) == []


def test_registry_invalid(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "registry" / "invalid", only=["REGISTRY"])
    messages = [f"{f.path}:{f.line}: {f.message}" for f in findings]
    joined = "\n".join(messages)
    assert "skills/alpha/assets/missing.md" in joined
    assert "'alpha' duplicada" in joined
    assert "'skills/ghost'" in joined and "não existe" in joined
    assert "não termina no name 'mismatch'" in joined
    assert "skills/orphan:1: skill 'orphan' ausente" in joined
    assert len(findings) == 5
    # a duplicata aponta para a segunda ocorrência, não para a primeira
    dup = next(f for f in findings if "duplicada" in f.message)
    first = next(f for f in findings if "missing.md" in f.message)
    assert dup.line > first.line


def test_registry_invalid_json(tmp_path):
    (tmp_path / "skills-registry.json").write_text("{ invalido", encoding="utf-8")
    findings = vp.run_checks(tmp_path, only=["registry"])
    assert len(findings) == 1 and "JSON inválido" in findings[0].message


def test_registry_missing_file(tmp_path):
    findings = vp.run_checks(tmp_path, only=["registry"])
    assert len(findings) == 1 and "ausente" in findings[0].message


# --------------------------------------------------------------------------- #
# LINKS
# --------------------------------------------------------------------------- #
def test_links_valid(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "links" / "valid", only=["links"]) == []


def test_links_invalid(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "links" / "invalid", only=["links"])
    assert pairs(findings) == {
        ("README.md", 3),
        ("README.md", 5),
        ("README.md", 6),
        ("context/a.md", 3),
        ("skills/demo-skill/SKILL.md", 8),
    }
    assert all(f.check == "LINKS" for f in findings)
    by_line = {f.line: f.message for f in findings if f.path == "README.md"}
    assert "secao-fantasma" in by_line[5]
    assert "secao-fantasma-local" in by_line[6]


def test_links_anchor_in_target_file(tmp_path):
    (tmp_path / "context").mkdir()
    (tmp_path / "context" / "a.md").write_text("# Título\n\n## Seção X\n", encoding="utf-8")
    (tmp_path / "README.md").write_text(
        "[ok](context/a.md#seção-x)\n[ruim](context/a.md#nao-existe)\n", encoding="utf-8"
    )
    findings = vp.run_checks(tmp_path, only=["LINKS"])
    assert len(findings) == 1
    assert findings[0].line == 2
    assert "nao-existe" in findings[0].message


def test_links_local_anchor(tmp_path):
    (tmp_path / "README.md").write_text(
        "# Minha Seção\n\n[ok](#minha-seção)\n[ruim](#fantasma)\n", encoding="utf-8"
    )
    findings = vp.run_checks(tmp_path, only=["links"])
    assert len(findings) == 1
    assert findings[0].line == 4
    assert "fantasma" in findings[0].message


def test_heading_slugs_dedup_suffix():
    text = "# Repetida\n\n## Repetida\n\n### Repetida\n"
    assert vp._heading_slugs(text) == {"repetida", "repetida-1", "repetida-2"}


def test_iter_md_links_ignores_code():
    text = "a [x](a.md) `[y](b.md)`\n```js\n[z](c.md)\n```\n[w](d.md \"t\")\n"
    assert list(vp.iter_md_links(text)) == [(1, "a.md"), (5, "d.md")]


def test_iter_md_links_labeled_captures_label_and_target():
    text = "ver [§ 2](a.md#s) e [Título](b.md).\n`[§ 9](ignorado.md)`\n"
    assert list(vp.iter_md_links_labeled(text)) == [
        (1, "§ 2", "a.md#s"),
        (1, "Título", "b.md"),
    ]


# --------------------------------------------------------------------------- #
# SECTION_REFS — link com rótulo `§ N` sem âncora.
# --------------------------------------------------------------------------- #
def test_section_refs_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "sections" / "ok", only=["SECTION_REFS"]) == []


def test_section_refs_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "sections" / "bad", only=["section-refs"])
    assert len(findings) == 1
    assert findings[0].path == "README.md"
    assert findings[0].line == 3
    assert findings[0].check == "SECTION_REFS"
    assert "sem âncora" in findings[0].message


def test_section_refs_autoref_with_anchor_is_ok(tmp_path):
    (tmp_path / "README.md").write_text(
        "# Doc\n\n## 2. Dois\n\nAuto-ref: [§ 2](#2-dois).\n", encoding="utf-8"
    )
    assert vp.run_checks(tmp_path, only=["SECTION_REFS"]) == []


# --------------------------------------------------------------------------- #
# SECTION_LINK_LABEL — número do rótulo difere do cabeçalho de destino.
# --------------------------------------------------------------------------- #
def test_section_link_label_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "sections" / "ok", only=["SECTION_LINK_LABEL"]) == []


def test_section_link_label_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "sections" / "bad", only=["section-label"])
    assert len(findings) == 1
    assert findings[0].path == "README.md"
    assert findings[0].line == 5
    assert findings[0].check == "SECTION_LINK_LABEL"
    assert "§ 5" in findings[0].message and "§ 4" in findings[0].message


def test_section_link_label_matching_number_is_ok(tmp_path):
    (tmp_path / "README.md").write_text(
        "# Doc\n\n## 21.4 Subseção\n\n[§ 21.4](#214-subseção)\n", encoding="utf-8"
    )
    assert vp.run_checks(tmp_path, only=["SECTION_LINK_LABEL"]) == []


def test_section_link_label_ignores_target_without_number(tmp_path):
    # Cabeçalho de destino sem número: SECTION_LINK_LABEL não tem o que comparar.
    (tmp_path / "README.md").write_text(
        "# Doc\n\n## Seção sem número\n\n[§ 3](#seção-sem-número)\n", encoding="utf-8"
    )
    assert vp.run_checks(tmp_path, only=["SECTION_LINK_LABEL"]) == []


# --------------------------------------------------------------------------- #
# PLAIN_SECTION_REFS — texto puro (desligado na varredura padrão).
# --------------------------------------------------------------------------- #
def test_plain_section_refs_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "sections" / "ok", only=["PLAIN_SECTION_REFS"]) == []


def test_plain_section_refs_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "sections" / "bad", only=["plain-section-refs"])
    assert len(findings) == 1
    assert findings[0].path == "README.md"
    assert findings[0].line == 7
    assert findings[0].check == "PLAIN_SECTION_REFS"
    assert "seção 7" in findings[0].message


def test_plain_section_refs_enabled_in_default_run(fixtures_dir):
    """Ligado na Task 8: PLAIN_SECTION_REFS roda na varredura padrão (sem --only)."""
    assert "PLAIN_SECTION_REFS" not in vp.DISABLED_IN_REPO
    default = vp.run_checks(fixtures_dir / "sections" / "bad")
    assert any(f.check == "PLAIN_SECTION_REFS" for f in default)


def test_plain_section_refs_matches_section_word_and_double_sign(tmp_path):
    (tmp_path / "README.md").write_text(
        "Veja §§ 11 e também as seções 3 adiante.\n", encoding="utf-8"
    )
    findings = vp.run_checks(tmp_path, only=["PLAIN_SECTION_REFS"])
    matched = {f.message.split("'")[1] for f in findings}
    assert "§§ 11" in matched
    assert "seções 3" in matched


# --------------------------------------------------------------------------- #
# CODE_ANCHOR_REFS — comentários de examples/ (desligado na varredura padrão).
# --------------------------------------------------------------------------- #
def test_code_anchor_refs_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "sections" / "ok", only=["CODE_ANCHOR_REFS"]) == []


def test_code_anchor_refs_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "sections" / "bad", only=["code-anchor-refs"])
    assert len(findings) == 1
    assert findings[0].path == "examples/widget.js"
    assert findings[0].line == 1
    assert findings[0].check == "CODE_ANCHOR_REFS"
    assert "sem âncora" in findings[0].message


def test_code_anchor_refs_enabled_in_default_run(fixtures_dir):
    """Ligado na Task 8: CODE_ANCHOR_REFS roda na varredura padrão (sem --only)."""
    assert "CODE_ANCHOR_REFS" not in vp.DISABLED_IN_REPO
    default = vp.run_checks(fixtures_dir / "sections" / "bad")
    assert any(f.check == "CODE_ANCHOR_REFS" for f in default)


# --------------------------------------------------------------------------- #
# RETIRED_FILES — lista vazia no repo (Task 3); preenchida na Task 8.
# --------------------------------------------------------------------------- #
def test_retired_files_populated_after_task8(fixtures_dir):
    """Task 8 preencheu RETIRED_FILES com os 4 nomes aposentados; o fixture 'bad'
    (que cita `partner-technologies.md`) passa a acusar."""
    assert set(vp.RETIRED_FILES) == {
        "partner-architecture.md",
        "partner-conventions.md",
        "partner-technologies.md",
        "partner-review-rules.md",
    }
    findings = vp.run_checks(fixtures_dir / "retired" / "bad", only=["RETIRED_FILES"])
    assert any(f.check == "RETIRED_FILES" for f in findings)


def test_retired_files_ok(fixtures_dir, monkeypatch):
    monkeypatch.setattr(vp, "RETIRED_FILES", ("partner-technologies.md",))
    assert vp.run_checks(fixtures_dir / "retired" / "ok", only=["RETIRED_FILES"]) == []


def test_retired_files_bad(fixtures_dir, monkeypatch):
    monkeypatch.setattr(vp, "RETIRED_FILES", ("partner-technologies.md",))
    findings = vp.run_checks(fixtures_dir / "retired" / "bad", only=["retired"])
    assert len(findings) == 1
    assert findings[0].path == "docs/README.md"
    assert findings[0].check == "RETIRED_FILES"
    assert "partner-technologies.md" in findings[0].message


def test_retired_files_covers_kiro_specs(tmp_path, monkeypatch):
    """RETIRED_FILES varre `.kiro/specs` (menos a spec da refatoração)."""
    monkeypatch.setattr(vp, "RETIRED_FILES", ("partner-technologies.md",))
    specs = tmp_path / ".kiro" / "specs"
    (specs / "x").mkdir(parents=True)
    (specs / "x" / "req.md").write_text("cita partner-technologies.md aqui\n", encoding="utf-8")
    (specs / "refactor-maven-store").mkdir()
    (specs / "refactor-maven-store" / "req.md").write_text(
        "cita partner-technologies.md aqui\n", encoding="utf-8"
    )
    findings = vp.run_checks(tmp_path, only=["RETIRED_FILES"])
    paths = {f.path for f in findings}
    assert ".kiro/specs/x/req.md" in paths
    assert ".kiro/specs/refactor-maven-store/req.md" not in paths


# --------------------------------------------------------------------------- #
# Helpers de número de seção
# --------------------------------------------------------------------------- #
def test_heading_numbers_by_slug():
    text = "# T\n\n## 21.4 Sub\n\n## §5 Cinco\n\n## Sem número\n"
    mapping = vp._heading_numbers_by_slug(text)
    assert mapping.get("214-sub") == "21.4"
    assert mapping.get("5-cinco") == "5"
    assert "sem-número" not in mapping


def test_heading_number_variants():
    assert vp._heading_number("21.4 Sub") == "21.4"
    assert vp._heading_number("§ 7 Sete") == "7"
    assert vp._heading_number("25. i18n") == "25"
    assert vp._heading_number("Sem número") is None


# --------------------------------------------------------------------------- #
# CONSTITUTION
# --------------------------------------------------------------------------- #
def test_constitution_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "constitution" / "ok", only=["constitution"]) == []


def test_constitution_i18n_backtick(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "i18n_backtick", only=["CONSTITUTION"])
    assert len(findings) == 1
    assert findings[0].path == "examples/widget.js"
    assert findings[0].line == 5
    assert "[=i18n" in findings[0].message


def test_constitution_i18n_dollar_in_js_is_valid(fixtures_dir):
    """`${i18n...}` em .js não é mais uma violação (sintaxe oficial, igual ao .ftl)."""
    assert vp.run_checks(fixtures_dir / "constitution" / "ok", only=["constitution"]) == []


def test_constitution_app_version(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "app_version", only=["constitution"])
    assert len(findings) == 1
    assert "application.version" in findings[0].message


def test_constitution_shorthand(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "shorthand", only=["constitution"])
    assert len(findings) == 1
    assert "shorthand" in findings[0].message
    assert findings[0].line == 3


def test_constitution_arrow_method(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "arrow_method", only=["constitution"])
    assert len(findings) == 1
    assert "arrow function" in findings[0].message
    assert findings[0].line == 3


def test_constitution_async_false(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "async_false", only=["constitution"])
    assert len(findings) == 1
    assert "async: false" in findings[0].message
    assert findings[0].line == 4


def test_constitution_md_region_only_flags_correct_block(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "constitution" / "md_region", only=["constitution"])
    assert findings == []


# --------------------------------------------------------------------------- #
# PARTNER_CALLOUT
# --------------------------------------------------------------------------- #
def test_partner_callout_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "callout" / "ok", only=["PARTNER_CALLOUT"]) == []


def test_partner_callout_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "callout" / "bad", only=["callout"])
    assert len(findings) == 1
    assert findings[0].path == "context/conventions.md"
    assert findings[0].check == "PARTNER_CALLOUT"
    assert "fora do callout" in findings[0].message


def test_partner_callout_bad_backend_java_maven(fixtures_dir):
    """`backend-java-maven.md` está em CORE_FILES: o link a partner-*.md fora do
    callout acusa; o mesmo link dentro de "> **Parceiro (Store):**" não."""
    findings = vp.run_checks(fixtures_dir / "callout" / "bad_backend", only=["PARTNER_CALLOUT"])
    assert len(findings) == 1
    assert findings[0].path == "context/backend-java-maven.md"
    assert findings[0].line == 5
    assert findings[0].check == "PARTNER_CALLOUT"
    assert "fora do callout" in findings[0].message


def test_partner_callout_real_repo_core_files(repo_root):
    assert vp.run_checks(repo_root, only=["PARTNER_CALLOUT"]) == []


# --------------------------------------------------------------------------- #
# OLD_NAMES
# --------------------------------------------------------------------------- #
def test_old_names_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "old_names" / "ok", only=["OLD_NAMES"]) == []


def test_old_names_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "old_names" / "bad", only=["old-names"])
    # 5 achados: linha 4 ('fluig-code-pre-review'), linha 5 (duas ocorrências de
    # 'fluig-pre-review-'), linha 6 ('fluig-pre-review-accessibility') e linhas 8/9
    # ('pre-review-component' + 'pre-review-widget'). O 'fluig-best-practices' da
    # linha 6 NÃO é sinalizado: é o nome oficial da skill, não um nome antigo.
    assert len(findings) == 5
    assert all(f.check == "OLD_NAMES" for f in findings)
    assert all(f.path == "docs/README.md" for f in findings)
    assert any("pre-review-component" in f.message for f in findings)
    assert any("pre-review-widget" in f.message for f in findings)


def test_old_names_does_not_flag_official_names(repo_root):
    """Os nomes oficiais da família de review não devem ser sinalizados pelo
    check OLD_NAMES: `fluig-code-review`, `fluig-review-{security,performance,
    accessibility}`, `fluig-best-practices` e as skills de parceiro
    `fluig-code-review-partner-{component,widgets}`."""
    findings = vp.run_checks(repo_root, only=["OLD_NAMES"])
    official = (
        "fluig-code-review",
        "fluig-review-security",
        "fluig-review-performance",
        "fluig-review-accessibility",
        "fluig-best-practices",
        "fluig-code-review-partner-component",
        "fluig-code-review-partner-widgets",
    )
    for name in official:
        assert all(f"'{name}'" not in f.message for f in findings)


def test_old_names_does_not_flag_partner_skills_output_filename(fixtures_dir):
    """O padrão de arquivo de saída `pre-review-widget-<AAAA-MM-DD>.md` (placeholder
    ou data real) não deve ser confundido com o nome antigo da skill."""
    findings = vp.run_checks(fixtures_dir / "old_names" / "ok", only=["OLD_NAMES"])
    assert findings == []


def test_old_names_flags_partner_skill_names(repo_root):
    """Os nomes antigos 'pre-review-component'/'pre-review-widget' (como skill) devem
    ser sinalizados fora de .kiro/specs e fora do padrão de arquivo de saída; o repo
    real já foi renomeado para fluig-code-review-partner-*, então não deve haver achado."""
    findings = vp.run_checks(repo_root, only=["OLD_NAMES"])
    assert all("pre-review-component" not in f.message for f in findings)
    assert all("pre-review-widget" not in f.message for f in findings)


# --------------------------------------------------------------------------- #
# PERSONA_ROUTER
# --------------------------------------------------------------------------- #
def test_persona_router_real_repo(repo_root):
    assert vp.run_checks(repo_root, only=["PERSONA_ROUTER"]) == []


def test_persona_router_missing_file(tmp_path):
    findings = vp.run_checks(tmp_path, only=["persona"])
    assert len(findings) == 1
    assert "ausente" in findings[0].message


def test_persona_router_missing_links_and_question(tmp_path):
    (tmp_path / "context").mkdir()
    (tmp_path / "context" / "persona-routing.md").write_text("sem links nem pergunta\n", encoding="utf-8")
    findings = vp.run_checks(tmp_path, only=["PERSONA_ROUTER"])
    messages = {f.message for f in findings}
    assert "não linka platform-constitution.md" in messages
    assert f"não linka {vp.STORE_ARCH_FILE}" in messages
    assert any("cabeçalho exato da pergunta" in m for m in messages)
    assert any("opção 1 exata" in m for m in messages)
    assert any("opção 2 exata" in m for m in messages)
    assert any("opção 3 exata" in m for m in messages)


def _write_persona_router(tmp_path, body: str) -> None:
    (tmp_path / "context").mkdir(exist_ok=True)
    (tmp_path / "context" / "persona-routing.md").write_text(body, encoding="utf-8")


_PERSONA_ROUTER_LINKS = (
    f"[c](platform-constitution.md) [a]({vp.STORE_ARCH_FILE})\n\n"
)


def test_persona_router_ok_header_and_options(tmp_path):
    """Caso ok: links obrigatórios + cabeçalho e as 3 opções exatas (como
    citação `>`, para exercitar a normalização) → nenhum achado."""
    options = "\n".join(f"> {i}. \"{opt}\"" for i, opt in enumerate(vp.PERSONA_OPTIONS, 1))
    body = (
        "# Roteador\n\n"
        + _PERSONA_ROUTER_LINKS
        + f"> {vp.PERSONA_QUESTION_HEADER}\n>\n"
        + options
        + "\n"
    )
    _write_persona_router(tmp_path, body)
    assert vp.run_checks(tmp_path, only=["PERSONA_ROUTER"]) == []


def test_persona_router_bad_missing_one_option(tmp_path):
    """Caso bad: cabeçalho e 2 opções presentes, mas falta a opção 3 →
    exatamente 1 achado, apontando a opção faltante."""
    options = "\n".join(f"{i}. \"{opt}\"" for i, opt in enumerate(vp.PERSONA_OPTIONS[:2], 1))
    body = (
        "# Roteador\n\n"
        + _PERSONA_ROUTER_LINKS
        + f"{vp.PERSONA_QUESTION_HEADER}\n\n"
        + options
        + "\n"
    )
    _write_persona_router(tmp_path, body)
    findings = vp.run_checks(tmp_path, only=["PERSONA_ROUTER"])
    messages = {f.message for f in findings}
    assert messages == {"não contém a opção 3 exata do roteamento por destino"}


def test_persona_router_bad_old_question_rejected(tmp_path):
    """Caso bad: a pergunta antiga (binária) não satisfaz o cabeçalho novo nem
    as 3 opções → acusa o cabeçalho e as 3 opções."""
    old_question = (
        "Para aplicarmos as regras corretas, me confirme: este desenvolvimento é "
        "para publicação na Store do TOTVS Fluig (Parceiro) ou é uma customização para "
        "um cliente (Consultor)?"
    )
    body = "# Roteador\n\n" + _PERSONA_ROUTER_LINKS + f"> {old_question}\n"
    _write_persona_router(tmp_path, body)
    findings = vp.run_checks(tmp_path, only=["PERSONA_ROUTER"])
    messages = {f.message for f in findings}
    assert "não contém o cabeçalho exato da pergunta do Passo 5 (roteamento por destino)" in messages
    assert any(f"opção {i} exata" in m for i in (1, 2, 3) for m in messages)


# --------------------------------------------------------------------------- #
# ENTRY_FILES
# --------------------------------------------------------------------------- #
def test_entry_files_ok(fixtures_dir):
    assert vp.run_checks(fixtures_dir / "entry_files" / "ok", only=["ENTRY_FILES"]) == []


def test_entry_files_bad(fixtures_dir):
    findings = vp.run_checks(fixtures_dir / "entry_files" / "bad", only=["entry-files"])
    by_path: dict[str, list[str]] = {}
    for f in findings:
        by_path.setdefault(f.path, []).append(f.message)
    assert any("persona-routing.md" in m for m in by_path["copilot-instructions.md"])
    assert any("platform-constitution.md" in m for m in by_path["copilot-instructions.md"])
    assert any("fluig-beta" in m for m in by_path["CLAUDE.md"])
    assert any("fluig-gamma" in m for m in by_path["README.md"])
    assert all(f.check == "ENTRY_FILES" for f in findings)


def test_entry_files_missing_file(tmp_path):
    (tmp_path / "skills-registry.json").write_text('{"skills": []}', encoding="utf-8")
    findings = vp.run_checks(tmp_path, only=["ENTRY_FILES"])
    missing = {f.path for f in findings if "ausente" in f.message}
    assert missing == set(vp.ENTRY_FILE_NAMES)


def test_entry_files_real_repo(repo_root):
    assert vp.run_checks(repo_root, only=["ENTRY_FILES"]) == []


# --------------------------------------------------------------------------- #
# Utilitários para checks futuros
# --------------------------------------------------------------------------- #
def test_iter_code_blocks():
    text = "texto\n```javascript\nconst a = 1;\n```\n~~~\nb\n~~~\n"
    blocks = list(vp.iter_code_blocks(text))
    assert [(b.lang, b.start_line, b.lines) for b in blocks] == [
        ("javascript", 3, ("const a = 1;",)),
        ("", 6, ("b",)),
    ]


def test_github_slug():
    assert vp.github_slug("Internacionalização (i18n) — Widgets e Layouts") == "internacionalização-i18n--widgets-e-layouts"
    assert vp.github_slug("Seção principal") == "seção-principal"


def test_strip_js_noise_preserves_lines():
    code = "var a = 'x // y'; // comentário\n/* bloco\n */ b(`t\nu`);\n"
    stripped = vp.strip_js_noise(code)
    assert stripped.count("\n") == code.count("\n")
    assert "comentário" not in stripped and "bloco" not in stripped and "x // y" not in stripped
    assert "x // y" in vp.strip_js_noise(code, keep_strings=True)


# --------------------------------------------------------------------------- #
# CLI / main
# --------------------------------------------------------------------------- #
@pytest.mark.parametrize("kind", ["frontmatter", "registry", "links"])
def test_main_valid_fixture_exits_zero(fixtures_dir, run, kind):
    code, out = run(fixtures_dir / kind / "valid")
    assert code == 0, out


def test_main_invalid_exits_one_with_format(fixtures_dir, run):
    code, out = run(fixtures_dir / "links" / "invalid", only=["LINKS"])
    assert code == 1
    assert "README.md:3: [LINKS] link relativo quebrado: 'context/faltando.md'" in out


def test_main_root_option_and_comma_only(fixtures_dir, capsys):
    code = vp.main(["--root", str(fixtures_dir / "registry" / "invalid"), "--only", "frontmatter,registry"])
    out = capsys.readouterr().out
    assert code == 1
    assert "[REGISTRY]" in out and "[SKILL_FRONTMATTER]" not in out


def test_main_list_checks(capsys):
    assert vp.main(["--list-checks"]) == 0
    out = capsys.readouterr().out
    for code in ("SKILL_FRONTMATTER", "REGISTRY", "LINKS"):
        assert code in out
    # os 5 checks novos da Task 3 aparecem em --list-checks
    for code in (
        "SECTION_REFS",
        "SECTION_LINK_LABEL",
        "PLAIN_SECTION_REFS",
        "CODE_ANCHOR_REFS",
        "RETIRED_FILES",
    ):
        assert code in out


def test_main_unknown_check(fixtures_dir):
    assert vp.main([str(fixtures_dir / "links" / "valid"), "--only", "NAO_EXISTE"]) == 2


def test_exclusions_skip_fixtures_and_clone(repo_root):
    pkg = vp.Package(repo_root)
    for rel in ("ci/tests/fixtures/links/valid/README.md", "fluig-agent-skills/README.md", ".kiro/x.md", ".agents/x.md"):
        assert pkg.is_excluded(repo_root / rel)
    assert not pkg.is_excluded(repo_root / "context" / "conventions.md")


# --------------------------------------------------------------------------- #
# Exceção [3]=a: `.kiro/specs/**` entra na varredura de .md, menos a spec da
# refatoração; o resto de `.kiro/` continua excluído.
# --------------------------------------------------------------------------- #
def test_kiro_specs_exception_scans_specs_but_not_other_kiro(tmp_path):
    specs = tmp_path / ".kiro" / "specs"
    (specs / "x").mkdir(parents=True)
    (specs / "x" / "req.md").write_text("# X\n", encoding="utf-8")
    (specs / "refactor-maven-store").mkdir()
    (specs / "refactor-maven-store" / "req.md").write_text("# refactor\n", encoding="utf-8")
    (tmp_path / ".kiro" / "outro").mkdir(parents=True)
    (tmp_path / ".kiro" / "outro" / "nota.md").write_text("# outro\n", encoding="utf-8")

    pkg = vp.Package(tmp_path)
    scanned = {pkg.rel(p) for p in pkg.md_files()}
    assert ".kiro/specs/x/req.md" in scanned
    assert ".kiro/specs/refactor-maven-store/req.md" not in scanned
    assert ".kiro/outro/nota.md" not in scanned

    assert not pkg.is_excluded(tmp_path / ".kiro" / "specs" / "x" / "req.md")
    assert pkg.is_excluded(tmp_path / ".kiro" / "specs" / "refactor-maven-store" / "req.md")
    assert pkg.is_excluded(tmp_path / ".kiro" / "outro" / "nota.md")


def test_kiro_specs_links_checked_but_refactor_spec_ignored(tmp_path):
    specs = tmp_path / ".kiro" / "specs"
    (specs / "x").mkdir(parents=True)
    # link quebrado numa spec varrida -> deve acusar
    (specs / "x" / "req.md").write_text("[quebrado](./nao-existe.md)\n", encoding="utf-8")
    # link quebrado na spec da refatoração (ignorada) -> NÃO deve acusar
    (specs / "refactor-maven-store").mkdir()
    (specs / "refactor-maven-store" / "req.md").write_text("[quebrado](./nao-existe.md)\n", encoding="utf-8")
    # link quebrado em outro ramo de .kiro (ignorado) -> NÃO deve acusar
    (tmp_path / ".kiro" / "outro").mkdir(parents=True)
    (tmp_path / ".kiro" / "outro" / "nota.md").write_text("[quebrado](./nao-existe.md)\n", encoding="utf-8")

    findings = vp.run_checks(tmp_path, only=["LINKS"])
    paths = {f.path for f in findings}
    assert ".kiro/specs/x/req.md" in paths
    assert ".kiro/specs/refactor-maven-store/req.md" not in paths
    assert ".kiro/outro/nota.md" not in paths


def test_runs_on_real_repo(repo_root):
    """O pacote real ainda tem falhas conhecidas; aqui só garantimos que roda.

    `.kiro/specs/**` (menos a spec da refatoração) agora entra na varredura
    pela exceção [3]=a; o resto de `.kiro/` continua fora.
    """
    findings = vp.run_checks(repo_root)
    assert all(isinstance(f, vp.Finding) for f in findings)
    assert not any(f.path.startswith(("fluig-agent-skills/", "ci/tests/fixtures/")) for f in findings)
    assert not any(f.path.startswith(".kiro/specs/refactor-maven-store/") for f in findings)
    for f in findings:
        if f.path.startswith(".kiro/"):
            assert f.path.startswith(".kiro/specs/"), f.path
