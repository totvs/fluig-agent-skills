# Exemplo: Wizard de Instalação (referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Demonstra o padrão de wizard com arquivo JS único, sem CSS customizado,
> usando exclusivamente componentes do Fluig Style Guide (Neo Star).

## Arquivos
- `view.ftl` — view FreeMarker com templates Mustache inline para renderização dinâmica. Usa Steps vertical, Panels, Labels, Alerts e Pager do Style Guide.
- `wizard.js` — **arquivo único** com `SuperWidget.extend({})` contendo toda a lógica: configuração dos steps (inline), verificação, instalação, navegação e feedback.
- `application.info` — descritor com 1 único JS, sem CSS, componente `fluigfilter` para picker de membros.
- `edit.ftl` — view de edição obrigatória (mínima).

## Cenário demonstrado
Wizard de 3 steps para um componente fictício `meuapp`:
1. **Termos de Uso** — aceitar termos antes de prosseguir (sem API, apenas checkbox);
2. **Instalação** — cria pasta + formulário (demonstra verificar → instalar → feedback);
3. **Conclusão** — CTA com link para a página principal;

## Padrões demonstrados
- **Verificar antes de instalar** (AC 2, Regra 1): cada recurso é checado via API antes de criar.
- **Idempotência** (AC 2, Regra 4): HTTP 409 tratado como sucesso.
- **Feedback individual** (AC 2, Regra 3): spinner → badge verde/amarelo/vermelho por recurso.
- **Dependências** (AC 4): formulário depende da pasta (usa `folderId` do resultado anterior).
- **Sem CSS** (AC 11): zero `application.resource.css.N`, só classes do Style Guide.
- **Componentes do Style Guide**: Steps vertical, Panel, Label, Alert, Pager, FLUIGC.toast.
- **Uma composição entre várias possíveis**: esta combinação (Steps vertical + Panel por step + Pager + Alert + Label) é **uma** opção válida dentre o vocabulário documentado em [`context/style-guide.md`](../../context/style-guide.md#vocabulário-de-componentes-para-wizards-de-instalação). Não há UI de wizard padrão/obrigatória — um wizard com menos ou mais steps, ou que precise listar muitos recursos provisionáveis (via `FLUIGC.datatable` em vez de cards), compõe os **mesmos blocos** de forma diferente.
- **Chamadas REST internas**: via `fetch()` + `async/await` + `try/catch`, com a URL pública montada a partir de `WCMAPI.getServerURL()` (nunca `async: false`/síncrono) → ver `context/platform-constitution.md`.
- **Sintaxe dentro de `.extend({})`**: métodos como `nome: function() {}` sem `var ctx = this;` (usa-se `this` direto) e callbacks em Arrow Functions `() => {}` — sem method shorthand ES6 nem arrow function como método → ver `context/conventions.md`.
- **i18n**: todo texto via `[=i18n.getTranslation("chave")]` em `.js` (código novo, sem colisão com template literals) e a sintaxe FreeMarker já usada no `.ftl` → ver `context/platform-constitution.md`.
- **Verificação sequencial (cenário mínimo)**: este exemplo verifica e instala cada recurso **sequencialmente** (sem lote/prefetch nem retry), por ser um cenário mínimo de 2 itens — para uma lista maior de recursos provisionáveis, ver o **padrão técnico de instalação em lote** (verificação em lote, retry, fallback, desabilitar/reabilitar o botão de trigger) documentado em [`context/partner-store-architecture.md`](../../context/partner-store-architecture.md#padrão-técnico-de-instalação-em-lote-crud-do-wizard).

## Pontos-chave
- Não há `WizardConfig.js` separado — a configuração fica como propriedade do widget.
- Não há módulos separados por tipo — a lógica de cada tipo (folder, cardindex) está inline.
- A IA ao gerar um wizard real pode refatorar em funções/métodos — o importante são as **regras**, não a estrutura de arquivos.
- `WCMAPI.getServerURL()` fornece a base URL para chamadas REST.
- `WCMAPI.getTenantId()` / `WCMAPI.getOrganizationId()` para multi-tenant.

> Fonte de verdade: `context/conventions.md`, `context/style-guide.md`, `context/platform-constitution.md`, `context/partner-store-architecture.md`.
