"""Homologação de cenários (Task 11) — simulação estática, sem geração real.

Traça 8 cenários (Consultor criar/manter/revisar; Consultor criar em projeto
Maven; Parceiro criar/manter/revisar; snippet ambíguo) usando as fixtures de
persona e o helper ``classify`` da
Task 4 (``test_persona_fixtures.py``) para decidir a persona, e lê o
``SKILL.md`` de cada skill envolvida para confirmar que o ramo Core nunca
"vaza" referência a ``partner-*.md`` e que o ramo Parceiro realmente carrega
essa camada.

Cada cenário é um ``Scenario`` com: fixture usada pelo roteador, skill
selecionada e a mensagem de persona esperada. A asserção central —
"nenhum link `partner-*` fora do ramo Parceiro" — é feita separando o texto
do `SKILL.md` nos cabeçalhos "### Core (sempre)" / "### Parceiro (somente se
persona = Parceiro)" (Task 6/7) e verificando que a região Core não contém
link para `partner-*.md`, enquanto a região Parceiro contém.
"""
from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

import pytest

import validate_package as vp
from tests.test_persona_fixtures import AMBIGUO, CONSULTOR, PARCEIRO, classify

REPO_ROOT = Path(__file__).resolve().parents[2]
SKILLS_DIR = REPO_ROOT / "skills"

# Link Markdown a `partner-*.md`, com ou sem `#âncora`.
_PARTNER_LINK_RE = re.compile(r"\]\([^)]*partner-[\w-]*\.md(?:#[^)]*)?\)")
_CORE_HEADING_RE = re.compile(r"^###\s+Core\s*\(sempre\)\s*$", re.MULTILINE)
_PARTNER_HEADING_RE = re.compile(
    r"^###\s+Parceiro\s*\(somente se persona = Parceiro\)\s*$", re.MULTILINE
)
# Fim da seção "Parceiro (somente se persona = Parceiro)": o próximo
# cabeçalho de qualquer nível (##, ###, ...).
_NEXT_HEADING_RE = re.compile(r"^#{1,6}\s+\S", re.MULTILINE)


def _skill_md(name: str) -> str:
    path = SKILLS_DIR / name / "SKILL.md"
    assert path.is_file(), f"SKILL.md ausente para a skill '{name}'"
    return path.read_text(encoding="utf-8")


def _split_core_partner_branches(text: str) -> tuple[str, str | None]:
    """Separa o texto em (ramo Core, ramo Parceiro | None).

    O ramo Core vai do início do arquivo até o cabeçalho "### Parceiro
    (somente se persona = Parceiro)" (se existir) ou até o fim do arquivo.
    O ramo Parceiro vai desse cabeçalho até o próximo cabeçalho de qualquer
    nível. Skills sem a divisão Core/Parceiro (ex.: as que "aplicam as
    mesmas regras técnicas independentemente da persona") devolvem
    ``(texto inteiro, None)`` — não há ramo Parceiro a validar.
    """
    partner_match = _PARTNER_HEADING_RE.search(text)
    if partner_match is None:
        return text, None
    core_branch = text[: partner_match.start()]
    rest = text[partner_match.end() :]
    next_heading = _NEXT_HEADING_RE.search(rest)
    partner_branch = rest[: next_heading.start()] if next_heading else rest
    # O restante do arquivo (depois do ramo Parceiro) não faz parte de
    # nenhum dos dois ramos de "Contexto de Referência" — ex.: "Estrutura de
    # Saída", "Regras Aplicáveis" podem ter suas próprias subseções "Ramo
    # Consultor"/"Ramo Parceiro" tratadas separadamente por quem chamar.
    return core_branch, partner_branch


def _assert_partner_links_only_in_partner_branch(text: str, label: str) -> None:
    """Garante, no texto de um `SKILL.md`, que nenhum link `partner-*.md`
    aparece fora do ramo "Parceiro (somente se persona = Parceiro)" e que esse
    ramo, quando declarado, tem ao menos um link. ``label`` identifica o
    arquivo nas mensagens."""
    core_branch, partner_branch = _split_core_partner_branches(text)
    core_links = _PARTNER_LINK_RE.findall(core_branch)
    assert not core_links, (
        f"{label}: link(s) a partner-*.md fora do ramo "
        f"Parceiro: {core_links}"
    )
    if partner_branch is not None:
        assert _PARTNER_LINK_RE.search(partner_branch), (
            f"{label}: ramo Parceiro declarado mas sem nenhum "
            "link a partner-*.md"
        )


def assert_no_partner_link_outside_partner_branch(skill_name: str) -> None:
    """Lê o `SKILL.md` da skill e garante que nenhum link `partner-*.md`
    aparece fora do ramo "Parceiro (somente se persona = Parceiro)"."""
    _assert_partner_links_only_in_partner_branch(_skill_md(skill_name), f"{skill_name}/SKILL.md")


def assert_has_persona_step(skill_name: str) -> None:
    """A skill linka persona-routing.md e emite a linha `Persona: ...`."""
    text = _skill_md(skill_name)
    assert "persona-routing.md" in text, f"{skill_name}/SKILL.md: sem link a persona-routing.md"
    assert "Persona: <Parceiro|Consultor> (motivo)" in text, (
        f"{skill_name}/SKILL.md: não emite a linha 'Persona: <Parceiro|Consultor> (motivo)'"
    )


_RAMO_CONSULTOR_HEADING_RE = re.compile(r"^###\s+Ramo Consultor\b.*$", re.MULTILINE)
_RAMO_PARCEIRO_HEADING_RE = re.compile(r"^###\s+Ramo Parceiro\b.*$", re.MULTILINE)
_BULLET_CONSULTOR_RE = re.compile(
    r"-\s+\*\*Consultor:\*\*.*?(?=\n-\s+\*\*Parceiro|\Z)", re.DOTALL
)
_BULLET_PARCEIRO_RE = re.compile(
    r"-\s+\*\*Parceiro(?:\s*\(Store\))?:\*\*.*?(?=\n-\s+\*\*(?!Parceiro)\S|\Z)", re.DOTALL
)


def _section_until_next_heading(text: str, heading_match: re.Match) -> str:
    rest = text[heading_match.end() :]
    next_heading = _NEXT_HEADING_RE.search(rest)
    return rest[: next_heading.start()] if next_heading else rest


def _consultor_scoped_text(text: str) -> str:
    """Trechos do SKILL.md que descrevem especificamente o que o **Consultor**
    recebe/faz: a seção "### Ramo Consultor" (Estrutura de Saída) e os
    bullets "**Consultor:** ..." (Saída Esperada/Checklist). Prosa geral do
    Passo 0 que apenas *menciona* o que o Parceiro faz não entra aqui."""
    parts: list[str] = []
    m = _RAMO_CONSULTOR_HEADING_RE.search(text)
    if m:
        parts.append(_section_until_next_heading(text, m))
    parts.extend(_BULLET_CONSULTOR_RE.findall(text))
    return "\n".join(parts)


def _parceiro_scoped_text(text: str) -> str:
    """Equivalente a `_consultor_scoped_text`, para o ramo/bullets Parceiro."""
    parts: list[str] = []
    m = _RAMO_PARCEIRO_HEADING_RE.search(text)
    if m:
        parts.append(_section_until_next_heading(text, m))
    parts.extend(_BULLET_PARCEIRO_RE.findall(text))
    return "\n".join(parts)


# --------------------------------------------------------------------------- #
# Modelo dos 8 cenários
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Scenario:
    id: str
    intencao: str  # criar | manter | revisar
    fixture: str  # nome da fixture em ci/tests/fixtures/persona/
    skill: str  # skill selecionada pelo roteador
    expected_persona: str  # PARCEIRO | CONSULTOR | AMBIGUO
    core_context_files: tuple[str, ...]
    partner_context_files: tuple[str, ...]  # vazio se não aplicável/ambíguo
    expected_output: str


SCENARIOS: tuple[Scenario, ...] = (
    Scenario(
        id="consultor-criar",
        intencao="criar",
        fixture="studio",
        skill="fluig-scaffolding-widget",
        expected_persona=CONSULTOR,
        core_context_files=(
            "conventions.md",
            "style-guide.md",
            "architecture.md",
            "platform-constitution.md",
        ),
        partner_context_files=(),
        expected_output=(
            "Esqueleto de widget na estrutura Fluig Studio (wcm/widget/<nome>), "
            "sem EAR, sem simple.deploy, sem prefixo salvo pedido explícito."
        ),
    ),
    Scenario(
        id="consultor-manter",
        intencao="manter",
        fixture="studio",
        skill="fluig-migrate-jquery-es6",
        expected_persona=CONSULTOR,
        core_context_files=(
            "conventions.md",
            "technologies.md",
            "platform-constitution.md",
        ),
        partner_context_files=(),
        expected_output=(
            "Código migrado para ES6+ equivalente, REST via fetch()+async/await, "
            "sem qualquer regra de empacotamento da Store."
        ),
    ),
    Scenario(
        id="consultor-revisar",
        intencao="revisar",
        fixture="studio",
        skill="fluig-code-review",
        expected_persona=CONSULTOR,
        core_context_files=(
            "conventions.md",
            "style-guide.md",
            "platform-constitution.md",
        ),
        partner_context_files=(),
        expected_output=(
            "Relatório de revisão gravado em review-<artefato>-<AAAA-MM-DD>.md na "
            "raiz do alvo, sem cabeçalho de pré-review e sem qualquer menção à "
            "Store ou ao App Review."
        ),
    ),
    Scenario(
        id="consultor-maven-criar",
        intencao="criar",
        fixture="maven-consultor",
        skill="fluig-scaffolding-widget",
        expected_persona=CONSULTOR,
        core_context_files=(
            "conventions.md",
            "style-guide.md",
            "architecture.md",
            "platform-constitution.md",
            "backend-java-maven.md",
        ),
        partner_context_files=(),
        expected_output=(
            "Novo módulo Maven widget-<code> no projeto multi-módulo do Consultor "
            "(packaging war, finalName=${project.artifactId}), registrado no POM "
            "raiz e no módulo pack (EAR), sem prefixo de namespacing e sem "
            "nenhuma camada da Store (component.xml, validação de slot)."
        ),
    ),
    Scenario(
        id="parceiro-criar",
        intencao="criar",
        fixture="partner",
        skill="fluig-scaffolding-widget",
        expected_persona=PARCEIRO,
        core_context_files=(
            "conventions.md",
            "style-guide.md",
            "architecture.md",
            "platform-constitution.md",
        ),
        partner_context_files=(vp.STORE_ARCH_FILE, vp.STORE_CONV_FILE),
        expected_output=(
            "Novo módulo Maven {artifactId}-widget com prefixo de namespacing "
            "aglutinado em application.code, simple.deploy obrigatório, "
            "registrado no POM raiz e no módulo pack (EAR)."
        ),
    ),
    Scenario(
        id="parceiro-manter",
        intencao="manter",
        fixture="partner",
        skill="fluig-migrate-jquery-es6",
        expected_persona=PARCEIRO,
        core_context_files=(
            "conventions.md",
            "technologies.md",
            "platform-constitution.md",
        ),
        # fluig-migrate-jquery-es6 aplica as mesmas regras técnicas
        # independentemente da persona — não há camada da Store envolvida.
        partner_context_files=(),
        expected_output=(
            "Código migrado para ES6+ equivalente, idêntico ao ramo Consultor "
            "(a migração jQuery→ES6+ não tem camada de empacotamento da Store)."
        ),
    ),
    Scenario(
        id="parceiro-revisar",
        intencao="revisar",
        fixture="partner",
        skill="fluig-code-review",
        expected_persona=PARCEIRO,
        core_context_files=(
            "conventions.md",
            "style-guide.md",
            "platform-constitution.md",
        ),
        partner_context_files=(vp.STORE_REVIEW_FILE,),
        expected_output=(
            "Relatório de pré-review preparatório, com cabeçalho de pré-review "
            "e gravado em pre-review-<artefato>-<AAAA-MM-DD>.md na raiz do alvo "
            "(não aprova, não substitui o App Review oficial)."
        ),
    ),
    Scenario(
        id="ambiguo-snippet",
        intencao="revisar",
        fixture="empty",
        skill="fluig-code-review",
        expected_persona=AMBIGUO,
        core_context_files=(),
        partner_context_files=(),
        expected_output=(
            "O roteador para e pergunta exatamente o cabeçalho "
            f"'{vp.PERSONA_QUESTION_HEADER}' seguido das 3 opções de destino "
            f"('{vp.PERSONA_OPTIONS[0]}', '{vp.PERSONA_OPTIONS[1]}', "
            f"'{vp.PERSONA_OPTIONS[2]}') — nenhuma skill executa até a resposta."
        ),
    ),
)


@pytest.fixture
def persona_dir(fixtures_dir: Path) -> Path:
    return fixtures_dir / "persona"


@pytest.mark.parametrize("scenario", SCENARIOS, ids=lambda s: s.id)
def test_router_classifies_persona_as_expected(scenario: Scenario, persona_dir: Path) -> None:
    """Passo do roteador que decide: a cascata (Task 4) classifica a fixture
    do cenário na persona esperada."""
    assert classify(persona_dir / scenario.fixture) == scenario.expected_persona


@pytest.mark.parametrize(
    "scenario", [s for s in SCENARIOS if s.expected_persona != AMBIGUO], ids=lambda s: s.id
)
def test_scenario_skill_declares_persona_step(scenario: Scenario) -> None:
    """Skill selecionada: possui o Passo 0 — Persona (link + linha emitida)."""
    assert_has_persona_step(scenario.skill)


@pytest.mark.parametrize(
    "scenario", [s for s in SCENARIOS if s.expected_persona != AMBIGUO], ids=lambda s: s.id
)
def test_scenario_no_partner_link_outside_partner_branch(scenario: Scenario) -> None:
    """FALHA o cenário se o SKILL.md envolvido deixar vazar um link
    `partner-*.md` fora do ramo Parceiro (violação da Constituição/camadas)."""
    assert_no_partner_link_outside_partner_branch(scenario.skill)


_ANCHORED_PARTNER_LINK = "[regra da Store](../../context/partner-x.md#slug)"


def _synthetic_skill_md(core_body: str, partner_body: str) -> str:
    """`SKILL.md` mínimo com os ramos "### Core (sempre)" e "### Parceiro
    (somente se persona = Parceiro)", seguidos de outra seção."""
    return (
        "## Contexto de Referência\n\n"
        "### Core (sempre)\n\n"
        f"{core_body}\n\n"
        "### Parceiro (somente se persona = Parceiro)\n\n"
        f"{partner_body}\n\n"
        "## Regras Aplicáveis\n\n"
        "Texto.\n"
    )


def test_anchored_partner_link_in_core_branch_is_detected() -> None:
    """Link `partner-x.md#slug` no ramo Core é vazamento e precisa ser
    detectado, com a âncora no achado."""
    # O regex anterior (sem `#âncora`) não via este link: é a lacuna fechada.
    assert not re.search(r"\]\([^)]*partner-[\w-]*\.md\)", _ANCHORED_PARTNER_LINK)
    text = _synthetic_skill_md(
        core_body=f"- {_ANCHORED_PARTNER_LINK}",
        partner_body="- [partner-x.md](../../context/partner-x.md)",
    )
    with pytest.raises(AssertionError, match=r"fora do ramo Parceiro: .*partner-x\.md#slug"):
        _assert_partner_links_only_in_partner_branch(text, "sintético/SKILL.md")


def test_anchored_partner_link_in_partner_branch_is_accepted() -> None:
    """O mesmo link com `#âncora` no ramo Parceiro está no lugar certo e conta
    como o link exigido nesse ramo."""
    text = _synthetic_skill_md(
        core_body="- [conventions.md](../../context/conventions.md#slug)",
        partner_body=f"- {_ANCHORED_PARTNER_LINK}",
    )
    _assert_partner_links_only_in_partner_branch(text, "sintético/SKILL.md")


_NEGATION_WINDOW_RE = re.compile(
    r"(?:\bsem\b|\bnão\b|\bnunca\b|\bignorando\b)[^.;]{0,90}$", re.IGNORECASE | re.DOTALL
)


def _is_negated_mention(scope: str, marker: str) -> bool:
    """``True`` se toda ocorrência de ``marker`` em ``scope`` estiver sob a
    sombra de uma negação próxima ("sem X", "não X", "nunca X", "ignorando
    X") no mesmo trecho — ou seja, o texto afirma a **ausência** de X, não a
    sua aplicação. Usado para não confundir "sem `simple.deploy`" (correto,
    Consultor não aplica a regra) com uma regra de fato aplicada."""
    start = 0
    while True:
        idx = scope.find(marker, start)
        if idx == -1:
            return True
        preceding = scope[max(0, idx - 90) : idx]
        if not _NEGATION_WINDOW_RE.search(preceding):
            return False
        start = idx + len(marker)


@pytest.mark.parametrize(
    "scenario",
    [s for s in SCENARIOS if s.expected_persona == CONSULTOR],
    ids=lambda s: s.id,
)
def test_consultor_path_never_reaches_store_markers(scenario: Scenario) -> None:
    """FALHA se o caminho Consultor (seção "Ramo Consultor" + bullets
    "**Consultor:**") de fato **aplicar** a camada da Store (prefixo de
    parceiro, ``component.xml``, validação de slot, pré-review) — menções que
    **negam** a regra ("sem prefixo", "sem qualquer menção à TOTVS Store") são
    o comportamento esperado e não contam como vazamento. Maven/EAR e
    ``simple.deploy`` são estruturais (valem para o Consultor que usa Maven) e
    **não** entram nesta lista."""
    text = _skill_md(scenario.skill)
    consultor_scope = _consultor_scoped_text(text)
    forbidden = (
        "TOTVS Store",
        "<prefixoparceiro>",
        "<PREFIXO_PARCEIRO>",
        "component.xml",
        "/license/api/v1/slots/",
        "pre-review-",
    )
    for marker in forbidden:
        assert _is_negated_mention(consultor_scope, marker), (
            f"{scenario.skill}/SKILL.md: marcador exclusivo de Parceiro "
            f"'{marker}' aplicado (não apenas negado) no escopo Consultor "
            "(vazamento)"
        )


@pytest.mark.parametrize(
    "scenario",
    [s for s in SCENARIOS if s.expected_persona == PARCEIRO and s.partner_context_files],
    ids=lambda s: s.id,
)
def test_parceiro_path_includes_store_layer(scenario: Scenario) -> None:
    """FALHA se o caminho Parceiro NÃO incluir a camada partner-*.md esperada
    (Store/prefixo/EAR/simple.deploy/pre-review-*.md, conforme a skill)."""
    text = _skill_md(scenario.skill)
    for partner_file in scenario.partner_context_files:
        assert partner_file in text, (
            f"{scenario.skill}/SKILL.md: não referencia '{partner_file}' — "
            "o ramo Parceiro não carrega a camada da Store esperada"
        )
    _, partner_branch = _split_core_partner_branches(text)
    if partner_branch is not None:
        for partner_file in scenario.partner_context_files:
            assert partner_file in partner_branch, (
                f"{scenario.skill}/SKILL.md: '{partner_file}' não está dentro "
                "do ramo '### Parceiro (somente se persona = Parceiro)'"
            )


def test_ambiguous_scenario_router_asks_before_any_skill() -> None:
    """Cenário do snippet ambíguo: a fixture 'empty' classifica como Ambíguo
    e persona-routing.md contém o cabeçalho e as 3 opções exatas do Passo 5 —
    nenhuma skill deve ser executada antes da resposta."""
    scenario = next(s for s in SCENARIOS if s.id == "ambiguo-snippet")
    assert scenario.expected_persona == AMBIGUO
    routing_text = (REPO_ROOT / "context" / "persona-routing.md").read_text(encoding="utf-8")
    unquoted = "\n".join(re.sub(r"^\s{0,3}>\s?", "", line) for line in routing_text.splitlines())
    normalized = " ".join(unquoted.split())
    assert " ".join(vp.PERSONA_QUESTION_HEADER.split()) in normalized
    for option in vp.PERSONA_OPTIONS:
        assert " ".join(option.split()) in normalized


def test_all_eight_scenarios_covered() -> None:
    """Garante que os 8 cenários exigidos pelo plano estão todos presentes:
    Consultor criar/manter/revisar; Consultor criar em projeto Maven; Parceiro
    criar/manter/revisar; ambíguo."""
    ids = {s.id for s in SCENARIOS}
    assert ids == {
        "consultor-criar",
        "consultor-manter",
        "consultor-revisar",
        "consultor-maven-criar",
        "parceiro-criar",
        "parceiro-manter",
        "parceiro-revisar",
        "ambiguo-snippet",
    }
