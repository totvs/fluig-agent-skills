# Exemplo: ActivationListener (Eventos de Componente — referência mínima)

> Trecho mínimo de referência. Não é um projeto completo.
> Reflete as APIs e convenções de `context/`.

## Arquivos

- `Activate.java` — EJB `@Stateless` + `@Remote` implementando
  `ActivationListener` (`com.fluig.sdk.api.component.activation.ActivationListener`)
  para o componente fictício `meuapp`: `getArtifactFileName()`, `install()` com
  o padrão de 5 passos comentado (safety check → idempotência → extração de
  recurso embarcado → upload/registro via API pública → criação dos registros
  de seed), `enable()` provisionando a credencial OAuth via
  `Keyring.provision(APP_KEY)`, e `disable()` como stub documentado.
- `ActivateRest.java` — camada REST (JAX-RS) que consome a credencial
  provisionada por `enable()`: `Keyring.getKeys(tenantId, APP_KEY)` → `KeyVO`
  → `DefaultOAuthConsumer` (signpost) → `HttpURLConnection` assinada → chamada
  a uma API pública do Fluig. Endpoint único, como padrão de referência.
- `MessageUtils.java` — utilitário de i18n backend (plain Java,
  `ResourceBundle` + `MessageFormat`) para o componente fictício `meuapp`:
  resolve o locale do chamador a partir do cabeçalho `Accept-Language`
  (`resolveLocale(HttpHeaders)`), carrega o bundle `messages[_locale].properties`
  correspondente e formata a mensagem com marcadores posicionais `{0}`/`{1}`,
  caindo para o bundle padrão em `MissingResourceException`
  (`getMessage(Locale, String, Object...)`). Consumido por `ActivateRest.java`
  para montar uma mensagem de erro localizada quando a chamada à API pública
  falha — ver `context/backend-java-maven.md` [i18n em Camada REST/Java (ResourceBundle)](../../context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle) (quarto mecanismo de
  i18n do Fluig, exclusivo do backend Java, distinto dos três domínios de
  `context/conventions.md`).
- `messages.properties`, `messages_pt_BR.properties`,
  `messages_en_US.properties`, `messages_es.properties` — bundles de mensagens
  consumidos por `MessageUtils.java`. Ver comentário de topo de cada arquivo
  para a justificativa da codificação escolhida (`\uXXXX` nos arquivos de
  locale, por cautela — ver `context/backend-java-maven.md` [Codificação dos bundles de locale](../../context/backend-java-maven.md#codificação-dos-bundles-de-locale)).

## O que é / quando usar vs. Wizard

É a **segunda rota** de provisionamento do modelo parceiro — alternativa ao
Wizard client-side. Critério de decisão (resumo; detalhe completo em
`context/partner-store-architecture.md`):

| Situação | Rota |
|----------|------|
| Sem interação do usuário; dado/seed já conhecido em tempo de build | `ActivationListener.install()` |
| Usuário precisa decidir/informar algo | Wizard client-side |

O gatilho de `install()`/`enable()`/`disable()` é exclusivo da **Central de
Componentes** (Painel de Controle → Aplicativos) ou da **Exportação/Importação
de Páginas** — nunca de um deploy manual arbitrário.

## Segundo padrão: credencial OAuth via Keyring em `enable()`

Além do provisionamento de formulário/dataset em `install()`, o mesmo
contrato tem um segundo uso: `enable()` chamando `Keyring.provision(APP_KEY)`
para que a plataforma gere e guarde a credencial OAuth do componente, e
`ActivateRest.java` recuperando-a em runtime via `Keyring.getKeys(tenantId,
APP_KEY)` para assinar chamadas a APIs públicas do Fluig. Útil quando uma
página **pública/anônima** precisa de dado protegido da plataforma sem expor
nenhum segredo no navegador. `APP_KEY` é seguro como constante porque é só um
identificador de busca (formato `XXXX-XXXX-XXXX-XXXX`) — não concede acesso a
nada por si só; quem concede acesso é a credencial real (consumer key/secret,
token/token secret), que a plataforma guarda no Keyring e nunca aparece no
fonte.

## Padrões demonstrados

- **Idempotência obrigatória em `install()`** — como a plataforma dispara
  `install()` de novo em toda reativação/atualização, o exemplo comenta a
  checagem de existência **antes** de criar o formulário/dataset.
- **Extração de recurso embarcado** — abertura do artefato implantado (WAR/EAR)
  como zip via a API de diretório de artefatos implantáveis, lendo
  `resources/form/` (HTML, `.properties` de título, ícone) e
  `resources/formdata/<locale>/*.properties` (um arquivo por registro de seed).
- **Provisionamento via API pública** — upload dos arquivos extraídos pela API
  pública de arquivos de conteúdo e registro do formulário pela API pública de
  card-index/form; criação de cada registro de seed pela API pública de
  card-item/form-record.
- **Safety check de admin de tenant** — `install()` recusa execução no
  contexto de um administrador de **instância** (cross-tenant/super-admin);
  exige administrador de **tenant**.
- **Credencial OAuth via Keyring** — `enable()` provisiona (`Keyring.provision`)
  e `ActivateRest.java` recupera (`Keyring.getKeys`) a credencial OAuth do
  componente para assinar chamadas a APIs públicas do Fluig, sem jamais
  colocar o segredo real no fonte.
- **i18n backend via `Accept-Language`** — `MessageUtils.java` resolve o
  locale do cabeçalho HTTP (não da sessão do usuário), porque este endpoint
  pode ser chamado por uma página pública/anônima sem sessão Fluig — mesmo
  cenário do padrão Keyring acima. Ver `context/backend-java-maven.md` [i18n em Camada REST/Java (ResourceBundle)](../../context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle)
  e a nota em `context/conventions.md` (seção "Os três domínios de i18n do
  Fluig").

Explicitamente **fora deste exemplo**: nenhum segredo literal em código em
NENHUM lugar (`APP_KEY` do Keyring é um identificador de busca, não um
segredo — ver seção acima; a credencial real nunca aparece no fonte, em
`enable()`/`ActivateRest.java` ou em qualquer outro ponto). Se o componente
integra outro serviço externo fora do padrão Keyring, o padrão é registrar via
a API pública de Cadastro de Serviços, com a credencial/URL vinda de um valor
coletado no wizard/geração ou de configuração — nunca um segredo literal no
fonte Java. Também fora de escopo: nenhum nome/link de projeto externo — este
é um **padrão de referência**, não um clone de projeto real.

> Fonte de verdade: `context/partner-store-architecture.md` (seção *Provisionamento
> via Eventos de Componente (ActivationListener)*),
> `context/partner-store-review-rules.md` [§ 28](../../context/partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store), e `context/partner-store-conventions.md`
> [i18n em Camada REST/Java (ResourceBundle)](../../context/backend-java-maven.md#i18n-em-camada-restjava-resourcebundle) (i18n backend via ResourceBundle).
