# Template de Relatório de Revisão de Código

> Asset da skill `fluig-code-review`. Estrutura padrão do relatório de revisão. Preencha
> cada seção com os achados reais. Cada achado **deve** ter severidade e referenciar
> a regra do arquivo de contexto (`conventions.md` ou `style-guide.md`, com a seção).
> O cabeçalho varia por persona (ver `context/persona-routing.md` e
> `conventions.md` › Saída do review por persona). **Ambas as personas gravam o
> relatório em `.md`** na raiz do alvo: use o cabeçalho **Consultor** para o
> relatório gravado em `review-<artefato>-<AAAA-MM-DD>.md`; use o cabeçalho
> **Parceiro** para o relatório gravado em `pre-review-<artefato>-<AAAA-MM-DD>.md`.

---

## Cabeçalho — Consultor

# Revisão de Código — <nome do artefato/arquivo>

> Análise de boas práticas para a customização do cliente. Gravada em
> `review-<artefato>-<AAAA-MM-DD>.md` na raiz do alvo, sem qualquer menção à
> Store ou ao App Review.
> - **Escopo:** <artefato/arquivo revisado>
> - **Avaliação geral:** <aprovado | aprovado com ressalvas | requer correções antes do merge>
> - **Achados:** Crítico <n> · Alto <n> · Médio <n> · Baixo <n>

## Cabeçalho — Parceiro (Store)

# Pré-Review de Código — <nome do artefato/arquivo>

> ⚠️ **Pré-review preparatório.** Este resultado é um passo interno de higiene e
> **não** significa aprovação: **não substitui o App Review oficial** da Store
> (`conventions.md` › Saída do review por persona; `partner-store-review-rules.md` [§ 32.9](../../../context/partner-store-review-rules.md#329-natureza-de-pré-review-não-é-aprovação)).
> - **Escopo:** <artefato/arquivo revisado>
> - **Parecer:** Provável Aprovação | Atenção | Correções Obrigatórias
> - **Achados:** Crítico <n> · Alto <n> · Médio <n> · Baixo <n>
>
> Este relatório deve ser **gravado** em `pre-review-<artefato>-<AAAA-MM-DD>.md` na
> raiz do alvo — a única escrita permitida (`partner-store-review-rules.md` [§ 32.10](../../../context/partner-store-review-rules.md#3210-persistência-do-relatório-em-arquivo-md) / [§ 32.1](../../../context/partner-store-review-rules.md#321-modo-somente-leitura)).

---

Use um dos cabeçalhos acima conforme a persona classificada; o restante do
relatório (Resumo em diante) é igual para as duas.

## Resumo

- **Artefato:** <widget | layout | form | Custom Element | CSS>
- **Arquivo(s) revisado(s):** <caminho/trecho>
- **Avaliação geral:** <aprovado | aprovado com ressalvas | requer correções antes do merge>

| Severidade | Quantidade |
|------------|-----------|
| 🔴 Crítico | <n> |
| 🟠 Alto | <n> |
| 🟡 Médio | <n> |
| 🔵 Baixo | <n> |

## Achados

> Ordene do mais grave ao menos grave. Omita as seções sem achados.

### 🔴 Crítico

- **<categoria> — <localização (arquivo/linha)>:** <descrição objetiva do problema>
  - **Regra:** `<conventions.md | style-guide.md>` › <seção>
  - **Recomendação:** <correção acionável> (skill aplicável: `<nome-da-skill>`)

### 🟠 Alto

- **<categoria> — <localização>:** <descrição>
  - **Regra:** `<arquivo de contexto>` › <seção>
  - **Recomendação:** <correção acionável>

### 🟡 Médio

- **<categoria> — <localização>:** <descrição>
  - **Regra:** `<arquivo de contexto>` › <seção>
  - **Recomendação:** <correção acionável>

### 🔵 Baixo

- **<categoria> — <localização>:** <descrição>
  - **Regra:** `<arquivo de contexto>` › <seção>
  - **Recomendação:** <correção acionável>

## Recomendações Gerais

- <recomendação transversal ou próximo passo, ex.: aplicar a skill `fluig-internationalization` no arquivo todo>
- <referência à skill especializada para aprofundamento, quando aplicável>

## Pontos Positivos

> Reconheça o que está correto — útil para o autor do código e para onboarding.

- <aspecto positivo 1 (ex.: bindings declarativos bem organizados)>
- <aspecto positivo 2 (ex.: i18n aplicada de forma consistente)>

## Plano de Ação

> Ordene por urgência; itens de severidade crítica/alta vêm primeiro.

1. [ ] **Antes do merge:** corrigir os achados críticos e altos.
2. [ ] **Em seguida:** tratar os achados médios (manutenção/performance).
3. [ ] **Quando possível:** aplicar os ajustes de baixa severidade.
4. [ ] **Re-revisão:** revalidar o artefato após as correções críticas.

## Categorias de Referência

ES6+ · Nomenclatura · Widget · Custom Element · i18n · Segurança · REST interna · CSS/Style Guide · Acessibilidade · Performance
