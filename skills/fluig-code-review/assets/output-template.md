# Template de Relatório de Revisão de Código

> Asset da skill `fluig-code-review`. Estrutura padrão do relatório de revisão. Preencha
> cada seção com os achados reais. Cada achado **deve** ter severidade e referenciar
> a regra do arquivo de contexto (`conventions.md` ou `style-guide.md`, com a seção).

---

# Relatório de Revisão — <nome do artefato/arquivo>

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
