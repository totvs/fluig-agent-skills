# Regras de Review da Solução para a Store do TOTVS Fluig (Parceiro)

> **Delta sobre a base.** Este arquivo documenta exclusivamente as **regras
> adicionais de review** que se aplicam a uma solução cujo **destino é a Store**
> (a vitrine de soluções de parceiros do TOTVS Fluig; App Review). São critérios
> que existem **além** das convenções gerais de desenvolvimento Fluig, cobertas em
> [conventions.md](conventions.md) (SuperWidget, instanceId, i18n, segurança),
> [style-guide.md](style-guide.md) (FLUIGC, variáveis CSS) e, para backend
> Java/Maven, [backend-java-maven.md](backend-java-maven.md) (módulos, EAR, JNDI,
> DAO, persistência). Para a **arquitetura de provisionamento específica da Store**
> (`component.xml`/`pages.xml`, Wizard, Keyring), veja
> [partner-store-architecture.md](partner-store-architecture.md). Para as
> **convenções específicas da Store** (nomenclatura, `application.info` da Store,
> versionamento, prefixo), veja
> [partner-store-conventions.md](partner-store-conventions.md).
>
> **Quando se aplica.** Somente quando o **destino da entrega é a Store** (persona
> Parceiro — detecção por marcador técnico de Store conforme
> [persona-routing.md](persona-routing.md)). Uma solução entregue a uma única
> empresa (persona Consultor) **não** carrega estas regras: os eixos genéricos de
> engenharia e de build vivem nas skills base e em
> [backend-java-maven.md](backend-java-maven.md).

---

## 1. License Server (Slot de Licenciamento)

Todo aplicativo publicado na Store deve validar licenciamento via **License
Server** usando o mecanismo de **slot**.

| Aspecto | Regra |
|---------|-------|
| Validação obrigatória | O componente DEVE validar o slot de licença no momento adequado (inicialização ou uso da funcionalidade principal) |
| Mecanismo | Consulta ao License Server via API interna da plataforma — o slot é provisionado pela Store no momento da compra |
| Comportamento sem licença | O componente DEVE degradar graciosamente ou exibir mensagem informativa quando o slot não estiver ativo |
| Slot por tenant | Cada tenant (empresa) possui seu próprio slot — a validação DEVE considerar o contexto multi-empresa |
| Endpoint de consulta | `[protocolo]://[host fluig]/license/api/v1/slots/{SlotID}` — verifica a disponibilidade do slot |
| Documentação interativa (ambiente de desenvolvimento) | Swagger em `[protocolo]://[host fluig]/license/swagger-ui/#/Slots` |
| Referência | Documentação do License Server disponível no portal de parceiros TOTVS |

> **SlotID por parceiro:** cada parceiro recebe um `SlotID` próprio para seu
> componente, usado no endpoint de consulta acima.

> **Consequência de ausência:** componente sem validação de License Server é
> reprovado no App Review — é requisito obrigatório para monetização na Store.

---

## 2. Credenciais e Tokens Expostos

Credenciais, tokens, API keys e secrets NÃO podem estar presentes no código-fonte
distribuído (código ativo, comentários ou arquivos de configuração embarcados no
EAR/WAR).

| Tipo | Regra |
|------|-------|
| Credenciais hardcoded em JS/Java | Proibido — usar Cadastro de Serviços (`fluigAPI`) ou variáveis de ambiente |
| Tokens em comentários | Proibido — comentários são distribuídos no artefato publicado |
| `client_secret` / `consumerSecret` em frontend | Proibido — fluxo OAuth com secret pertence ao backend |
| `btoa('user:pass')` (Basic Auth) | Proibido — credencial literal codificada em base64 |
| Placeholders (`"CHANGE_ME"`, `"TODO"`, `"xxx"`) | Permitido com ressalva — indicam que o parceiro sabe que deve substituir, mas devem ser removidos antes do deploy final |
| `WCMAPI.getToken()` | Permitido — é API pública de sessão, não é credencial hardcoded |
| Tokens em `localStorage`/`sessionStorage` | Proibido — armazenamento client-side de dados sensíveis expõe a ataques XSS |
| Credenciais em logs (`console.log(token)`) | Proibido — expõe dado sensível no console do navegador |

> **Armazenamento seguro:** o Fluig oferece o **Cadastro de Serviços** como
> mecanismo oficial para armazenar URLs, usuários e senhas de integrações
> externas, acessíveis via `fluigAPI` no backend.

---

## 3. Termos de Uso e Política de Privacidade

Aplicativos publicados na Store devem apresentar ou referenciar documentação
legal obrigatória.

| Documento | Regra |
|-----------|-------|
| Termos de Uso | O parceiro DEVE disponibilizar Termos de Uso acessíveis ao usuário final — seja via link na documentação do app, tela de primeiro acesso ou página dedicada |
| Política de Privacidade | O parceiro DEVE disponibilizar Política de Privacidade descrevendo quais dados são coletados, como são tratados e com quem são compartilhados |
| Localização | Os documentos podem ser hospedados externamente (site do parceiro) desde que o link seja estável e acessível |
| Idioma | Devem estar disponíveis em português (Brasil) no mínimo |

> **Consequência de ausência:** aplicativos sem Termos de Uso ou Política de
> Privacidade acessíveis são reprovados no App Review.

---

## 4. Grafia da Marca TOTVS e Fluig

O uso das marcas TOTVS e Fluig em artefatos do parceiro segue regras de grafia
oficial.

| Marca | Grafia correta | Grafias incorretas |
|-------|----------------|--------------------|
| TOTVS | `TOTVS` (todas maiúsculas) | `Totvs`, `totvs`, `ToTvs`, `TOTVs` |
| TOTVS Fluig | `TOTVS Fluig` (plataforma; `Fluig` sozinho é aceito ao referir a plataforma) | `fluig`, `FLUIG`, `FluIG` |
| Store | `Store` — é a **vitrine de soluções de parceiros dentro do TOTVS Fluig** (não é marca própria). Referir como "a **Store**" ou "a Store do TOTVS Fluig" | **`Fluig Store`**, **`TOTVS Store`** (não existem como marca), `fluig store`, `FLUIG STORE` |

| Contexto | Regra |
|----------|-------|
| Documentação do app | Usar grafia oficial em toda menção |
| Código-fonte (variáveis, comentários) | Grafia interna (ex.: `fluigAPI`) segue a convenção técnica da plataforma — não é violação |
| Interface do usuário (labels, mensagens) | Usar grafia oficial quando a marca aparecer visível ao usuário |
| `application.info` / `component.xml` | Campos técnicos seguem convenção do descritor — não é violação de marca |

> **Aplicação:** a regra de grafia se aplica a textos visíveis ao usuário final e
> documentação — não a identificadores internos de código ou descritores técnicos.

---

## 5. CDN Externo

Recursos carregados de CDNs externos (`https://cdn.exemplo.com/...`,
`https://unpkg.com/...`, `https://cdnjs.cloudflare.com/...`) são **proibidos** em
aplicativos da Store.

| Aspecto | Regra |
|---------|-------|
| `<script src="https://...">` em FTL | Proibido — violação Crítica |
| `<link href="https://...">` em FTL | Proibido — violação Crítica |
| `@import url('https://...')` em CSS | Proibido — violação Crítica |
| `fetch('https://cdn...')` para carregar libs | Proibido — violação Crítica |
| Fontes externas (Google Fonts, etc.) | Proibido — empacotar localmente |

| Motivo da proibição | Descrição |
|---------------------|-----------|
| Disponibilidade | Ambientes on-premise podem não ter acesso à internet |
| Performance | Latência adicional e ponto de falha externo |
| Segurança | CDN comprometido pode injetar código malicioso |
| CORS | Políticas de segurança do servidor podem bloquear recursos externos |
| Auditoria | Impossibilita controle de versão e inspeção do código carregado |

> **Correção:** empacotar o recurso localmente em `src/main/webapp/resources/` e
> declará-lo no `application.info` com sequência e tipo corretos. A regra genérica
> de preferir recursos locais à CDN vive em
> [Recursos locais (sem CDN)](conventions.md#recursos-locais-sem-cdn); aqui a
> proibição é **bloqueante** para a Store.

---

## 6. component.xml

O descritor `component.xml` (módulo config) identifica o componente na plataforma
e define metadados obrigatórios para publicação na Store.

| Propriedade | Regra |
|-------------|-------|
| `code` (atributo de `<component code="…">`) | Identificador único do componente — DEVE ser consistente com `application.code` dos widgets |
| `<title>` | Nome de exibição do componente na Store (exibido nos Itens da Store) |
| `<description>` | Descrição funcional — DEVE ser clara e refletir o propósito real do app |
| `<version>` | Versão semântica — DEVE corresponder à versão do POM (`${revision}`) |
| `<developerCode>` / `<developerName>` / `<developerURL>` | Dados do parceiro desenvolvedor (código do portal da Store, nome da empresa, site) — NÃO pode conter nomes de máquina local (`DESKTOP-*`, `LAPTOP-*`) |
| `<category>` | Categoria da Store — DEVE ser uma categoria válida do catálogo |
| Unicidade | O `<code>` DEVE ser único no ecossistema Store — conflito com componente existente causa rejeição |
| Imutabilidade pós-publicação | Depois que o app é publicado na Store, o `<code>` é a **chave de identidade** que liga as atualizações ao app existente. Alterá-lo NÃO atualiza o app publicado — a plataforma passa a tratá-lo como um **app novo/distinto** na Store, quebrando o canal de atualização dos clientes que já o instalaram |

> **`<code>` é chave de identidade — não renomear app publicado:** o `<code>` é uma
> **chave de identidade** e segue a regra transversal de imutabilidade pós-publicação
> ([§ 4.5](partner-store-conventions.md#45-imutabilidade-do-code-do-componentxml)).
> A convenção de identificador (lowercase sem separadores, alinhada ao context-root
> — [§ 2](partner-store-conventions.md#2-applicationinfo-exigido-pela-store)) é
> aplicada **na criação** (Scaffolding). Em **pré-review**, um `<code>` fora da
> convenção num app **já publicado** NÃO deve ser recomendado para renomeação
> (viraria app novo na Store): manter como está e, no máximo, registrar como
> **informativo/"VERIFICAR MANUALMENTE"**
> ([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)). **Modernize
> preserva** o `<code>`. Só sugerir padronização com confirmação de que o app ainda
> **não foi publicado**.

> **Localização:** `{artifactId}-config/src/main/resources/component.xml`

**Integridade de campos e placeholders do `component.xml`:** além da presença dos
campos, verificar a **qualidade** do metadado que será exibido na Store. Ler o
arquivo real por inteiro antes de acusar
([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)):

| Verificação | Regra | Severidade |
|-------------|-------|------------|
| `<icon>` presente e não-vazio | DEVE existir com valor não-vazio (ícone personalizado — ver [§ 21](#21-ícones-personalizados-de-páginas-e-widgets)); cruza com o `application.info` (ver [Integridade dos recursos e chaves (review)](architecture.md#integridade-dos-recursos-e-chaves-review)) | Recomendado ([§ 21](#21-ícones-personalizados-de-páginas-e-widgets)) |
| `<title>` ≠ `<description>` triviais | `title` e `description` idênticos ou genéricos indicam metadado de baixa qualidade para a Store | Baixo · "VERIFICAR MANUALMENTE" |
| Placeholder/baseline residual | `code`, `title`, `description` ou `developer*` ainda com valores do baseline `sample-component` indicam export não personalizado | Médio |
| Typo óbvio em `title`/`description` | Erro de digitação no texto visível ao usuário na Store (heurística — não bloquear) | Baixo · "VERIFICAR MANUALMENTE" |
| `<version>` × descritores | O `<version>` DEVE coincidir com os demais descritores do pacote (ver [§ 4.4](partner-store-conventions.md#44-sincronia-mandatória-de-descritores)) | Crítico/Bloqueante ([§ 4.4](partner-store-conventions.md#44-sincronia-mandatória-de-descritores)) |

> **Anti-falso-positivo:** typo e `title`≈`description` são **semânticos** — reportar
> como Baixo com "VERIFICAR MANUALMENTE"
> ([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)), nunca como
> bloqueante. Só o descasamento de `<version>` é bloqueante.

> **Campos adicionais do parceiro não são validados:** o pré-review verifica apenas os
> **campos obrigatórios** do `component.xml` (tabela acima). Tags **opcionais/adicionais**
> que o parceiro possa incluir não são exigidas nem cobradas — ausência de campo não
> obrigatório **não é achado**.

---

## 6.1 pages.xml — Estrutura, Unicidade e Coerência da Hierarquia

O descritor `pages.xml` (módulo config) define a árvore de páginas do componente
publicadas na plataforma. Sua estrutura interna DEVE ser coerente para o deploy e a
navegação funcionarem.

| Regra | Detalhe | Severidade quando violada |
|-------|---------|---------------------------|
| Página raiz agrupadora única | O `pages.xml` DEVE ter **uma única** `<page>` na raiz representando o app; as demais páginas DEVEM ser filhas dela | Alta |
| Unicidade de `<code>` | O `<code>` de cada `<page>` DEVE ser **único** dentro do `pages.xml`; dois `<page>` com o mesmo `<code>` são colisão de identidade e causam resolução ambígua no deploy | Alta |
| Coerência `parentCode` ↔ `code` | Todo `<parentCode>` de uma página filha DEVE corresponder ao `<code>` de uma página pai efetivamente declarada no mesmo arquivo | Alta |
| Página órfã | `<parentCode>` que referencia um `<code>` inexistente na hierarquia é página órfã — não é renderizada corretamente | Alta |
| Divergência pai/filho | Filha declarada dentro de um pai cujo `<code>` não corresponde ao `<parentCode>` declarado é inconsistência estrutural | Alta |

> **Natureza da verificação:** unicidade de `<code>`, página raiz única e coerência
> `parentCode`↔`code` são **inconsistências internas do próprio arquivo** (não
> dependem do ambiente Fluig de destino) — classificar como violação, não como aviso
> de verificação. A integridade referencial de recursos externos (`<widget>`,
> `<layout>`, `role`/`group`) que dependem do ambiente segue o
> [Ciclo de Provisionamento e Parametrização via Wizard](partner-store-architecture.md#ciclo-de-provisionamento-e-parametrização-via-wizard)
> e o princípio anti-falso-positivo
> ([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)).

> **Localização:** `{artifactId}-config/src/main/resources/pages.xml`

---

## 7. Modelo de Distribuição EAR

Aplicativos da Store são distribuídos como **EAR** (Enterprise Archive) gerado
pelo módulo `pack` do projeto Maven.

| Aspecto | Regra |
|---------|-------|
| Formato de entrega | EAR gerado por `mvn clean install` — é o único formato aceito pela Store |
| Conteúdo do EAR | DEVE conter todos os módulos necessários (config, widgets, layouts, services) — nada pode depender de instalação manual separada |
| Dependências externas | Bibliotecas de terceiros DEVEM ser embarcadas no EAR (scope `compile`) — NÃO assumir que estarão disponíveis no servidor |
| Tamanho | Minimizar tamanho do EAR — remover source maps, arquivos de teste, node_modules, `.git` e outros artefatos de desenvolvimento |
| Reprodutibilidade | O build DEVE ser reprodutível — qualquer desenvolvedor com acesso ao código-fonte deve conseguir gerar o mesmo EAR via `mvn clean install` |
| Módulos obrigatórios | `config` e `pack` são obrigatórios — sem eles o componente não pode ser instalado |
| Arquivos proibidos no EAR | `.map` (source maps), arquivos de teste, `node_modules/`, `.git/`, arquivos temporários de IDE |

> **Detalhes de empacotamento:** a estrutura genérica do módulo pack e a
> configuração do `maven-ear-plugin` são fonte de verdade em
> [Empacotamento EAR (Módulo Pack)](backend-java-maven.md#empacotamento-ear-módulo-pack);
> aqui vale o delta de que **a Store só aceita o EAR** como formato de entrega.

---

## 8. LGPD (Lei Geral de Proteção de Dados)

Aplicativos publicados na Store devem estar em conformidade com a LGPD (Lei
nº 13.709/2018).

| Aspecto | Regra |
|---------|-------|
| Coleta de dados pessoais | O app DEVE informar ao usuário quais dados pessoais são coletados e para qual finalidade |
| Consentimento | Se o app coleta dados além do mínimo necessário para sua funcionalidade, DEVE obter consentimento explícito |
| Armazenamento | Dados pessoais armazenados pelo app DEVEM ter política de retenção definida |
| Compartilhamento | Se o app transmite dados para serviços externos (APIs de terceiros), DEVE documentar com quem os dados são compartilhados |
| Eliminação | O app DEVE oferecer mecanismo para que o usuário solicite eliminação de seus dados pessoais |
| Dados sensíveis | Dados sensíveis (saúde, biometria, religião, orientação sexual) exigem consentimento específico e tratamento diferenciado |
| Logs e rastreamento | Logs do app NÃO devem conter dados pessoais identificáveis sem necessidade técnica justificada |
| Política de Privacidade | Obrigatória — veja [§ 3](#3-termos-de-uso-e-política-de-privacidade) deste documento |

> **Responsabilidade:** o parceiro é o controlador dos dados coletados por seu
> app. A TOTVS (como operadora da plataforma) não se responsabiliza pelo
> tratamento de dados feito pelo aplicativo do parceiro.

---

## 9. application.uiwidget e Documentação

A propriedade `application.uiwidget` no `application.info` controla se o widget
aparece na tela de seleção de widgets ao editar páginas.

| Valor | Significado | Regra de documentação |
|-------|-------------|----------------------|
| `true` | Widget disponível para seleção na edição de páginas | A documentação do app DEVE mencionar que o widget está disponível para seleção pelo administrador de páginas |
| `false` | Widget NÃO aparece na seleção (usado internamente, ex.: wizard de instalação) | Nenhuma exigência adicional de documentação |
| Ausente | Propriedade não declarada | Violação — DEVE estar presente com valor explícito (`true` ou `false`) |

> O valor (`true`/`false`) é decisão de negócio do parceiro — o pré-review **NÃO**
> força um valor específico; apenas exige **presença** com valor explícito.
> **Consequência:** ausência de `application.uiwidget` é violação no App Review.

---

## 10. Classificação de Achados — App Review

O App Review classifica requisitos em duas categorias conforme o tipo de solução:

| Classificação | Significado |
|---------------|-------------|
| **Impede aprovação** | Requisito obrigatório violado — bloqueia publicação na Store |
| **Recomendado** | Melhoria esperada — não bloqueia, mas eleva qualidade e pode ser cobrado em futuras revisões |

A classificação varia por tipo de solução (Flows, Aplicativo, Runner). A skill
deve perguntar o tipo ao parceiro e aplicar a coluna correspondente.

### Achados que impedem aprovação (Aplicativo)

Critérios de aprovação obrigatória para aplicativos:

- Falhas de segurança (credenciais expostas, XSS, endpoints sem auth)
- APIs internas / instanciação de classes internas da plataforma
- CDN/recursos externos
- SuperWidget/application.info incorreto
- Fluig Style Guide não utilizado
- Frameworks/bibliotecas desatualizadas
- Codificação não UTF-8
- Valores fixos de ambiente (código empresa, usuário, protocolo, pasta)
- License Server não validado
- Serviços externos sem SSL/TLS
- groupId reservado (`com.fluig`/`com.totvs`)
- artifactId padrão sample-component
- Versionamento fora do POM raiz
- Módulos web não declarados no POM raiz
- Formato EAR incorreto
- Marca Fluig/TOTVS no nome da solução
- Termos de Uso / Política de Privacidade ausentes
- Instalação com erros

### Achados recomendados (Aplicativo)

- Documentação de portabilidade
- Detalhamento técnico de alterações
- Cadastro de serviços
- Ícones personalizados
- Nomenclatura sem conflito
- Conceitos nativos reutilizados
- Responsividade / usabilidade / feedback
- Mensagens sem conteúdo técnico

---

## 11. Exceções Anti-Falso-Positivo — Widgets

Padrões que NUNCA devem gerar achado numa revisão de widgets:

| Padrão | Motivo |
|--------|--------|
| `.html('<literal fixo>')` | String fixa, não é XSS |
| `.html('')` | Limpeza de conteúdo |
| `.text(variável)` | jQuery `.text()` escapa HTML |
| `WCMAPI.getToken()` | API pública de sessão |
| `<script src="/webdesk/vcXMLRPC.js">` | Recurso de plataforma |
| `var Nome = SuperWidget.extend(...)` | Padrão obrigatório de declaração |
| `application.type=layout` | Fora do escopo da skill de widgets |
| `console.error` dentro de `catch` | Debug aceitável |
| CSS vars com override `html.theme-dark` | Dark mode correto |
| Bundles de frameworks em FTL | Decisão de negócio aceita |
| `class="template_*_${instanceId}"` para FLUIGC | Padrão aceito de vinculação |

**Precedência:** exceção > segurança > domínio > genérica. A exceção sempre vence.

---

## 12. Classificação de Origem XSS

| Origem | Classificação |
|--------|---------------|
| Literal fixo / string vazia / `i18n.getTranslation()` / `.text()` | NÃO é XSS — não reportar |
| Resposta de API/AJAX / dado de dataset | XSS — impede aprovação |
| Input de usuário (`.val()`, `FormData`) | XSS — impede aprovação |
| Parâmetro de URL (`location.search`, `location.hash`) | XSS — impede aprovação |
| Origem ambígua | Reportar + "VERIFICAR MANUALMENTE" |

---

## 13. Classificação de `async:false` por Padrão

| Padrão | Contexto | Classificação |
|--------|----------|---------------|
| Loop | `for`, `while`, `$.each`, `.forEach` | Impede aprovação |
| Orquestração massiva | 10+ chamadas síncronas sequenciais | Impede aprovação |
| Orquestração curta | 2-5 chamadas síncronas | Recomendado |
| Isolada | Chamada única e independente | Recomendado |

---

## 14. Recomendações de Correção Seguras

Diretrizes para sugestões de correção que NÃO introduzam novos problemas:

| Cenário | Regra |
|---------|-------|
| Dataset sem constraints | NUNCA sugerir chamada a dataset de alto volume sem filtro |
| Migração `async:false` | Sugerir lotes + progresso + try/catch. NUNCA "remova async:false" sem substituição |
| Sanitização XSS | `DOMPurify.sanitize()` ou `.text()`. NUNCA regex como sanitização |
| CDN → local | Empacotar em `resources/`, declarar no `application.info`, versão fixa |

---

## 15. Codificação UTF-8

Todos os arquivos-fonte do componente (JS, FTL, CSS, `.properties`, XML) e todas
as requisições/respostas de API DEVEM usar codificação **UTF-8**.

| Aspecto | Regra |
|---------|-------|
| Arquivos do projeto | DEVEM ser salvos em UTF-8 — codificações alternativas (ISO-8859-1, Windows-1252) causam exibição incorreta de acentos e caracteres especiais |
| Respostas REST | DEVEM declarar charset UTF-8 (`application/json; charset=utf-8`) — nunca `application/json` sem charset |
| Arquivos de locale (`.properties`) | Arquivo em **UTF-8** **e** caracteres especiais (ç, á, é…) em escape `\uXXXX` — **os dois juntos**, não "um ou outro" (garante exibição correta em qualquer SO; fonte oficial TDN i18n). O arquivo **base** (`<code>.properties`, fallback em português) admite acento direto; os locais com texto acentuado (`_pt_BR`, `_es`) usam `\uXXXX`. Ver [Codificação UTF-8 (Arquivos e APIs)](conventions.md#codificação-utf-8-arquivos-e-apis) |
| Requisições a serviços externos | DEVEM enviar/receber em UTF-8 para preservar integridade de dados |

> **Consequência de ausência:** caracteres acentuados corrompidos na interface
> comprometem a experiência do usuário e podem reprovar no App Review.

---

## 16. Valores Fixos de Ambiente (Hardcode Proibido)

O componente NÃO pode conter valores fixos que dependem do ambiente do cliente.
Esses valores variam entre instalações e, se codificados, tornam o recurso
indisponível ou incorreto em outros ambientes.

| Valor fixo proibido | Alternativa correta |
|---------------------|---------------------|
| Código da empresa / tenant | Obter em runtime via API de sessão (`WCMAPI`) ou serviço de segurança no backend |
| Código/login de usuário | Obter do contexto autenticado da plataforma |
| Protocolo fixo (`http://`) | Derivar do ambiente via `WCMAPI.getServerURL()`; URLs externas sempre `https://` |
| Código/ID de pasta de publicação | Parametrizar em configuração alterável pelo cliente |
| Caminhos absolutos de servidor | Resolver relativamente ao ambiente |

> **Correção:** substituir o literal por resolução dinâmica (API de plataforma no
> frontend, serviço de segurança/contexto no backend) ou por parâmetro de
> configuração. A regra genérica de não fixar valores de ambiente vive em
> [Sem valores fixos de ambiente](conventions.md#sem-valores-fixos-de-ambiente).

---

## 17. Parametrização (Configurações Alteráveis)

Configurações operacionais do componente DEVEM ser alteráveis pelo cliente. Não
é permitido embutir valores de configuração fixos que o cliente não possa ajustar.

| Configuração | Regra |
|--------------|-------|
| Pasta de publicação de formulários/processos | DEVE ser parametrizável |
| Periodicidade de notificações / sincronização | DEVE ser parametrizável |
| Endpoints/credenciais de integração | DEVEM vir do Cadastro de Serviços ou tela de configuração — nunca fixos no código |
| Limiares e regras de negócio configuráveis | DEVEM ser expostos em configuração quando fizer sentido para o cliente |

> **Consequência:** configurações fixas que impedem ajuste pelo cliente são
> violação — o componente deve ler parâmetros de uma fonte de configuração
> (formulário de config, Cadastro de Serviços, tela de wizard). Base genérica em
> [Parametrização de configurações](conventions.md#parametrização-de-configurações).

---

## 18. SSL/TLS Obrigatório em Serviços Externos

Toda comunicação com serviços externos (persistência de dados, integrações,
autenticação, chat, webhooks) DEVE usar endereços seguros (`https://`, SSL/TLS).

| Aspecto | Regra |
|---------|-------|
| URLs externas em código/config | DEVEM iniciar com `https://` — `http://` para serviço externo é violação Crítica |
| URLs declaradas no `application.info` | DEVEM ser `https://` |
| URLs de metadado (POM/descritores) | `developer*`/`<url>`, `<organization><url>` e `<url>` do projeto DEVEM usar `https://` — `http://` em metadado é Baixo (higiene) |
| URL de repositório Nexus | `<repository><url>` em `http://` é **canal de build**, não gatilho de reprovação na Store — recomendar `https://` como boa prática (higiene de build), sem inflar severidade (Médio · "VERIFICAR MANUALMENTE") |
| Persistência de dados em serviço externo | Exige canal seguro (SSL/TLS) — dado trafegando sem criptografia é falha de segurança |
| Autenticação sem HTTPS | Proibido — expõe credenciais em trânsito |

> **Consequência de ausência:** serviços externos sem SSL/TLS comprometem a
> segurança das informações e são reprovados no App Review. Ambientes seguros do
> Fluig podem bloquear chamadas não criptografadas. Base genérica em
> [URLs externas com SSL/TLS](conventions.md#urls-externas-com-ssltls).

---

## 19. Falhas de Segurança de Acesso

O componente NÃO pode possuir falhas que comprometam o ambiente do cliente.

| Falha | Regra |
|-------|-------|
| Endpoint sem autenticação | Toda ação que altere dados ou execute operações DEVE exigir sessão autenticada |
| Recuperação de dados de autenticação | Proibido expor tokens/credenciais em resposta, log ou armazenamento client-side |
| Execução de serviço sem autorização | Validar permissão/role antes de executar operação sensível |
| Vazamento de dados multi-empresa | Toda consulta DEVE filtrar por tenant (ver [Multi-Empresa (SecurityService)](backend-java-maven.md#multi-empresa-securityservice)) |

> **Consequência:** qualquer falha que permita recuperar credenciais, executar
> serviços sem autenticação ou comprometer o ambiente do cliente reprova no App
> Review.

---

## 20. Dependências de Produção (Enxutas)

O artefato distribuído DEVE conter apenas dependências realmente necessárias em
produção.

| Aspecto | Regra |
|---------|-------|
| Dependências Java (Maven) | Somente as necessárias em produção — remover dependências de desenvolvimento, teste ou otimização temporária antes de publicar |
| Bibliotecas JS/CSS duplicadas ou não usadas | DEVEM ser removidas |
| Bibliotecas já disponíveis na plataforma | NÃO reembarcar — reutilizar a versão nativa do Fluig |
| Frameworks/bibliotecas desatualizadas | Evitar libs obsoletas ou já cobertas pela plataforma (ex.: utilitários de data legados, seletores DOM legados, templating legado) — risco de performance e segurança |

> **Correção:** revisar o `pom.xml` e os recursos declarados no `application.info`,
> removendo tudo que não é usado em produção e substituindo libs obsoletas por
> APIs nativas da plataforma.

---

## 21. Ícones Personalizados de Páginas e Widgets

Páginas e widgets do componente DEVEM usar ícones personalizados, não o ícone
padrão da plataforma.

| Aspecto | Regra |
|---------|-------|
| `application.icon` do widget | DEVE apontar para ícone próprio, não vazio nem apenas espaços |
| Ícone da página / menu | DEVE ser personalizado quando o componente publica páginas |
| Qualidade | Ícones/imagens DEVEM ter boa resolução para exibição correta na plataforma |
| Recurso local | Ícones DEVEM estar embarcados em `resources/` — nunca carregados de CDN externo |

> **Classificação:** ícone personalizado é **Recomendado** (melhora a experiência
> de uso); ausência de `application.icon` com valor explícito é violação de
> `application.info`.

---

## 22. Análise Contextual e Heurísticas Anti-Falso-Positivo

A análise (pré-review, geração ou refatoração) DEVE decidir por **contexto real**, não
por padrão sintático isolado. Antes de classificar um achado, ler o entorno do
trecho e confirmar a origem/uso.

| Verificação | Procedimento obrigatório |
|-------------|--------------------------|
| XSS via `.html()`/`.append()`/`innerHTML` | Ler ±10 linhas e rastrear a ORIGEM da variável: literal/i18n/`.text()` → não é XSS; API/dataset/input/URL → XSS. Toda anotação de achado deve indicar arquivo + linha + variável + origem |
| `.html('<literal fixo>')` / `.html('')` | Nunca é XSS — não reportar |
| Propriedade "ausente" (`simple.deploy`, `application.uiwidget`, versão) | Ler o arquivo real por inteiro e buscar a string exata ANTES de acusar ausência. Nunca reportar ausência por memória/cache |
| Discrepância de versão (`component.xml` vs POM) | Ler ambos os arquivos reais e comparar os valores lidos. Se iguais → não reportar |
| Dependência desatualizada | Ler a versão real no `pom.xml`. Se já ≥ versão recomendada → não reportar |
| `.html()` de origem ambígua | Reportar como Médio com nota "VERIFICAR MANUALMENTE" e o trecho exato |

> **Princípio:** na dúvida, investigar mais (ler o código, buscar referências) —
> nunca inventar achado nem extrapolar a partir de amostra. Cobertura é 100% ou o
> relatório é marcado como incompleto.

---

## 23. Contagem e Classificação de Chamadas Síncronas (Volumetria)

`async:false` e `DatasetFactory.getDataset()` client-side devem ser **contados** (não
agrupados como "vários") e classificados por padrão de uso, pois o impacto é
cumulativo.

| Situação | Como identificar | Classificação |
|----------|------------------|---------------|
| Loop | chamada síncrona dentro de `for`/`while`/`.each`/`.forEach` | Crítica (impede aprovação) |
| Orquestração massiva | 10+ chamadas síncronas sequenciais no mesmo fluxo (ex.: wizard de instalação) | Crítica — trava o navegador; `F5` no meio corrompe estado |
| Orquestração curta | 2-5 chamadas síncronas com dependência de dados | Recomendado (bloqueia UI, não trava) |
| Isolada | chamada única sem dependência de resultado anterior | Recomendado |

**Volumetria acumulada (wizards / instaladores):** multiplicar chamadas por iteração
(ex.: 5 chamadas × N páginas). Escala de severidade por total: < 10 baixo; 10-30
alto; 30-100 crítico; > 100 bloqueante. 30+ ocorrências no mesmo arquivo = Crítico
automático. Verificar mecanismo de recuperação (checkpoint/rollback); ausência agrava.

> **Correção segura:** migrar para assíncrono com lotes, feedback de progresso e
> tratamento de erro com checkpoint. Nunca "remover `async:false`" sem substituição.
> Nunca sugerir consulta a dataset de alto volume (colleague, document, group) sem
> `constraints`.

---

## 24. Datasets — Estrutura, Classificação e Mapa de Dependências

Regras de pré-review/geração/refatoração de datasets server-side além da segurança SQL
([§ 2](#2-credenciais-e-tokens-expostos), [§ 12](#12-classificação-de-origem-xss)–[§ 14](#14-recomendações-de-correção-seguras)).

| Aspecto | Regra |
|---------|-------|
| Funções nomeadas | Registrar quais das 4 existem (`createDataset`, `defineStructure`, `onSync`, `onMobileSync`) como informativo — ausência não é violação por si só |
| Classificação por tipo | Classificar cada dataset: Integração REST, Integração SOAP, Utilitário ou Lista/Consulta — orienta a análise de risco |
| Proxy SQL aberto | Query montada a partir de `fields[0]` ou `constraints[x].initialValue` recebidos externamente → Crítica. Query hardcoded internamente → OK |
| Classes internas via stub | `com.totvs.technology.*` instanciada por `ServiceManager`/`serviceHelper.instantiate()` (stub de WebService) → OK; instanciada diretamente com `new` → Crítica |
| `java.util.Base64` / `Thread.sleep` / `importClass(java.lang.Thread)` | Proibido |
| `java.net.*` / `java.io.*` | Recomendação — preferir `fluigAPI.getAuthorizeClientService()` com Cadastro de Serviços |
| SDK público | `DatasetBuilder`, `DatasetFactory`, `log`, `fluigAPI`, `com.fluig.sdk.*`, `javax.naming.InitialContext` (JDBC cadastrado) → OK |
| Cache global | Variável global usada como cache (ex.: `HashMap`) → OK; variável global sem uso → poluição |
| Prefixo de log | Logs sem prefixo `@NomeSolucao` → Recomendado (rastreabilidade); `[DEBUG]` em produção → evitar; log de token/senha → Crítica |

**Mapa de Dependências (obrigatório para conjuntos de datasets):** para cada dataset
mapear quem ele chama (`DatasetFactory.getDataset("nome")`) e quem o chama.
Cadeia de 3+ níveis → alerta de performance; chamada dentro de loop → violação;
dataset consumido por 5+ artefatos → gargalo potencial (informativo).

---

## 25. Eventos de Processo BPM, Formulário e Globais

Checklist único aplicável a scripts server-side (Rhino) de processos, formulários e
eventos globais.

| # | Verificação | Severidade |
|---|-------------|------------|
| 1 | `Thread.sleep` | Crítica (bloqueia thread do servidor) |
| 2 | `com.totvs.technology.*` / `importClass` / `java.lang.Thread` | Crítica (classe interna) |
| 3 | `java.net.URL` / `java.io.*` (conexão direta) | Crítica |
| 4 | Credenciais hardcoded (senha, token, `Bearer`) | Crítica |
| 5 | `DatasetFactory`/REST dentro de `for`/`while` | Alta (performance) |
| 6 | Ausência de `try/catch` | Alerta |
| 7 | Logs sem prefixo `@NomeSolucao` | Recomendado |
| 8 | Código morto / variável não usada | Recomendado |

**Semântica de eventos (não classificar como violação):**

| Padrão | Nota |
|--------|------|
| `throw "msg"` em evento *before* | Padrão documentado para interromper com mensagem |
| `afterStateEntry` que ignora erro | O motor ignora exceções em eventos *after* silenciosamente |
| `beforeTaskComplete` | NÃO interrompe a movimentação |
| `hAPI.*`, `DatasetFactory.*`, `fluigAPI.*`, `ServiceManager.*`, `getValue("WK*")`, `log.*` | APIs públicas |
| `oauthUtil.getNewAPIConsumerAsCurrentUser(...)` | OK; com key/secret/token literais → Crítica |

**ServiceTask (`servicetaskX.js`):** assinatura `function servicetaskX(attempt, message)`;
sucesso = `return true`, falha = `throw "erro"`. Modo Imediata (síncrono) ou
Automatizada (N tentativas + fluxo de erro).

**Risco específico de eventos globais:** `beforeLogin` com lógica pesada sem `try/catch`
pode bloquear TODOS os logins; `onNotify`/`beforeSendNotification` sem validação de
template afeta TODOS os e-mails; logar `user.getPassword()` → Crítica.

---

## 26. Cobertura de Validação de Formulário

Formulários com campos de entrada DEVEM ter validação server-side (`validateForm.js`).
Indicação visual (`required`, `is-required`) não substitui *enforcement*.

| Tipo de formulário | Sem `validateForm.js` | Severidade |
|--------------------|-----------------------|------------|
| Configuração de credenciais/integração | permite salvar config incompleta → falha em processos dependentes | Alta |
| Campos marcados obrigatórios | indicação visual sem *enforcement* server-side | Média |
| Sub-formulário simples (poucos campos) | permite registros incompletos, sem impacto sistêmico | Baixa |

**Outros pontos:** `<script>` inline com lógica no HTML → mover para evento separado;
`setEnable` → depreciado (não usar); eventos client-side (`beforeMovementOptions`,
`beforeSendValidate`) vs server-side (`displayFields`, `validateForm`, `afterProcessing`)
executam em contextos distintos — respeitar o contexto ao mover/gerar código.

---

## 27. Integração de Frameworks Front-End (Angular / React / Vue)

Aplicável APENAS a widgets/layouts que embarcam framework moderno. Base: padrão
oficial documentado pela TOTVS (Angular + PO UI no Fluig).

| Verificação | Regra |
|-------------|-------|
| Empacotamento | Bundles JS/CSS DEVEM ser declarados no `application.info` (não via `<script src>` direto no FTL). Exceção: layouts que seguem o padrão oficial de framework → alerta, não violação |
| Ponto de montagem | `<app-root>` (ou equivalente) no FTL → OK |
| Variáveis de contexto | Passar via `window['_app_*']` no FTL (`_app_route`, `_app_page_code`, `_app_tenant`) — padrão oficial e recomendado |
| Base href | `<base href>` fixo no FTL → violação; usar `APP_BASE_HREF` dinâmico lido de `window['_app_*']` |
| Subpáginas | "Habilitar subpáginas" na página Fluig DEVE estar desabilitado para apps com roteamento próprio (senão causa 404 nas rotas) |
| Build | Integrar o build ao ciclo Maven (`frontend-maven-plugin`); `outputPath` aponta para `resources/` da widget |
| Bundles | Minificados em produção; sem *source maps* (`.map`); polyfills/`zone.js` não duplicados; tamanho total elevado (> 2 MB) → alerta de performance |
| Lazy Load | Boa prática para apps com múltiplas rotas; ausência em app grande (> 5 rotas) → alerta |
| i18n | Via biblioteca do framework + idioma ativo da plataforma (`WCMAPI.locale`) consumido por serviço dedicado |
| Segurança | Tokens/`environment.ts` sensíveis, JWT hardcoded → Crítica; acesso direto a `WCMAPI.*` no código do framework → alerta (encapsular em serviço); CDN externo → violação |
| `index.html` do framework em produção | Violação — em produção o carregamento é via `view.ftl` |

---

## 28. Java, Build e Empacotamento — Exigências da Store

Delta de pré-review/geração para o projeto Java-Maven **no que a Store exige além do
build genérico**. A estrutura de módulos, o `maven-ear-plugin`, a hierarquia de
dependências e o checklist genérico de build/empacotamento são fonte de verdade em
[backend-java-maven.md](backend-java-maven.md) (qualquer persona). Esta seção
registra apenas o que a Store acrescenta e os pontos de atenção de pré-review.

| Aspecto | Exigência da Store / ponto de atenção |
|---------|---------------------------------------|
| Módulos web declarados | Todo módulo WAR existente no disco DEVE constar em `<modules>` do POM pai — WAR não declarado é violação; módulo declarado sem diretório é configuração morta |
| Minificação | `yuicompressor-maven-plugin` (CSS) e `closure-compiler-maven-plugin` (JS) são o padrão oficial; ausência → performance/tamanho do EAR |
| Manifesto WAR | `maven-war-plugin` deve conter `Dependencies: com.fluig.common` no manifesto; ausência pode impedir carregamento dos módulos Fluig |
| `warSourceExcludes` | Excluir originais não-minificados do WAR (evita duplicação) |
| Artefatos soltos na raiz | `datasets/`, `forms/`, `workflow/` fora do EAR → Crítica, SALVO se houver wizard que os empacota e instala via API pública (verificar antes de acusar) |
| Ativação | `<activationClass>` no `component.xml` é **opcional**. Quando **presente**, o componente DEVE ter uma classe de ativação implementando `ActivationListener` com os **4 métodos** do contrato; o vínculo `activationClass` ↔ `component.xml` e o padrão de `install()`/Keyring são fonte de verdade em [ActivationListener na Store (`activationClass` e Keyring)](partner-store-architecture.md#activationlistener-na-store-activationclass-e-keyring). **Ausência de `<activationClass>` NÃO é achado.** |
| Arquivos de desenvolvimento | `.project`, `git-comandos.txt`, `.map`, `node_modules/`, `.git/` não devem ir no entregável |

**Classificação de vulnerabilidades por escopo de dependência:**

| Escopo | Responsabilidade | Classificação |
|--------|------------------|---------------|
| `provided` (fluig-sdk, javaee-api) | Plataforma | Débito Técnico da plataforma — não é violação do parceiro |
| `compile` (libs do parceiro) | Parceiro | Violação — deve atualizar |
| Mesma versão do sample-component | Baseline | Não é erro do parceiro |
| Versão mais antiga que o sample-component | Parceiro | Erro — deveria ter atualizado |

**Versões seguras mínimas conhecidas (referência de auditoria de dependências):**
`gson ≥ 2.8.9`, `okhttp ≥ 4.9.2`, `okio ≥ 3.4.0`, `underscore.js ≥ 1.13.6`,
`log4j ≥ 2.17.1` (Log4Shell), `jackson-databind ≥ 2.13.4`, `commons-text ≥ 1.10.0`,
`spring-core ≥ 5.3.18`.

> Esta lista é de **higiene de segurança** — **se** uma biblioteca de terceiro
> estiver presente (por necessidade justificada ou herança transitiva), que seja
> numa versão **sem CVE conhecido**. Ela **não** recomenda adicionar essas libs:
> a decisão de incluir qualquer dependência externa segue o **princípio de preferir
> o nativo/embarcado** ([§ 5](#5-cdn-externo) e
> [Dependências Maven — Escopos Corretos](backend-java-maven.md#dependências-maven--escopos-corretos)).

**Baseline do sample-component:** quando o projeto É o `sample-component` oficial
(`groupId=com.fluig`, `artifactId=sample-component`), padrões didáticos do template
(textos placeholder, `APP_KEY` de exemplo, `System.out.println`, endpoints sem auth,
Nexus HTTP) são intencionais — documentar como "baseline", não como violação.

**Falsos positivos comuns:** `com.totvs.technology.foundation.common.*` (AbstractDAO,
ServiceLocator, FDN*Exception) é SDK público — não é API interna; `ServiceLocator`
é o pattern homologado para lookup cross-module EJB→WAR; libs sem manutenção mas na
última versão e sem CVE → não reportar; dependência na mesma versão do sample-component
→ baseline.

---

## 29. Mapa Requisito → Regra Abstrata (App Review)

Referência interna de rastreabilidade. As regras acima são **universais e
autossuficientes**; este mapa apenas orienta a manutenção do pacote e NÃO deve ser
exposto em relatórios ao parceiro.

| Regra abstrata | Seção |
|----------------|-------|
| License Server (slot) | [§ 1](#1-license-server-slot-de-licenciamento) |
| Credenciais e tokens expostos | [§ 2](#2-credenciais-e-tokens-expostos) |
| Termos de Uso / Política de Privacidade | [§ 3](#3-termos-de-uso-e-política-de-privacidade) |
| Grafia da marca | [§ 4](#4-grafia-da-marca-totvs-e-fluig) |
| CDN externo | [§ 5](#5-cdn-externo) |
| `component.xml` / `pages.xml` | [§ 6](#6-componentxml) / [§ 6.1](#61-pagesxml--estrutura-unicidade-e-coerência-da-hierarquia) |
| Modelo de distribuição EAR | [§ 7](#7-modelo-de-distribuição-ear) |
| LGPD | [§ 8](#8-lgpd-lei-geral-de-proteção-de-dados) |
| `application.uiwidget` e documentação | [§ 9](#9-applicationuiwidget-e-documentação) |
| Codificação UTF-8 | [§ 15](#15-codificação-utf-8) |
| Valores fixos de ambiente | [§ 16](#16-valores-fixos-de-ambiente-hardcode-proibido) |
| Parametrização | [§ 17](#17-parametrização-configurações-alteráveis) |
| SSL/TLS obrigatório | [§ 18](#18-ssltls-obrigatório-em-serviços-externos) |
| Falhas de segurança de acesso | [§ 19](#19-falhas-de-segurança-de-acesso) |
| Dependências de produção enxutas | [§ 20](#20-dependências-de-produção-enxutas) |
| Ícones personalizados | [§ 21](#21-ícones-personalizados-de-páginas-e-widgets) |
| Análise contextual e anti-falso-positivo | [§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo) |
| Volumetria de chamadas síncronas | [§ 23](#23-contagem-e-classificação-de-chamadas-síncronas-volumetria) |
| Datasets: estrutura, tipo e dependências | [§ 24](#24-datasets--estrutura-classificação-e-mapa-de-dependências) |
| Eventos BPM/formulário/globais | [§ 25](#25-eventos-de-processo-bpm-formulário-e-globais) |
| Cobertura de validação de formulário | [§ 26](#26-cobertura-de-validação-de-formulário) |
| Integração de frameworks front-end | [§ 27](#27-integração-de-frameworks-front-end-angular--react--vue) |
| Java/Build/Empacotamento — exigências da Store | [§ 28](#28-java-build-e-empacotamento--exigências-da-store) |
| Reuso de componentes de negócio nativos | [§ 30](#30-reuso-de-componentes-de-negócio-nativos) |
| Separação de responsabilidades no FTL (widget) | [§ 31](#31-separação-de-responsabilidades-no-ftl-widget) |
| Metodologia do relatório de pré-review (contrato transversal) | [§ 32](#32-metodologia-do-relatório-de-pré-review-contrato-transversal) |

---

## 30. Reuso de Componentes de Negócio Nativos

O Fluig oferece **Componentes de Negócio** (facilitadores JavaScript oficiais)
que encapsulam funcionalidades de negócio recorrentes. Reimplementar do zero uma
funcionalidade já coberta por um componente nativo é **retrabalho**, tende a
divergir do padrão visual/UX da plataforma e frequentemente recai em uso de APIs
internas ou duplicação do Style Guide. A especificação completa de cada componente
(assinatura, parâmetros, dependência) está em
[business-components.md](business-components.md) — **fonte de verdade**; esta seção
apenas define **quando exigir/sugerir o reuso**.

| Componente de Negócio | Método | Substitui (código customizado a evitar) |
|-----------------------|--------|------------------------------------------|
| Busca de documentos | `ECMBC.searchDocument` | Modal próprio de navegação/seleção de documentos e pastas do ECM |
| Busca de documento em comunidade | `ECMBC.sharingDocument` | Modal próprio de busca/inserção de documento numa comunidade |
| Atualizar arquivo físico | `ECMBC.updateDocument` | Fluxo próprio de upload/versionamento de documento |
| Renomear documentos e pastas | `ECMBC.renameDocument` | Modal próprio de renomear documento/pasta |
| Recorte de imagem | `WCMBC.cropImage` | Cropper de terceiros (ex.: cropper.js) para foto de usuário/comunidade |
| Seleção de usuários | `WCMBC.selectUser` | Modal próprio "selecionar usuários" com consulta ao dataset `colleague` |
| Seleção de grupos | `WCMBC.selectGroup` | Modal próprio de seleção de grupos |
| Seleção de papéis | `WCMBC.selectRole` | Modal próprio de seleção de papéis |
| Seleção de sub grupos | `WCMBC.selectUser` (com `group`) | Modal próprio de seleção de sub grupos |
| Seleção de comunidades | `SOCIALBC.selectCommunity` | Modal próprio de seleção de comunidades |
| Compartilhar | `SOCIALBC.share` | Componente próprio de compartilhamento social |
| Listar compartilhamentos | `SOCIALBC.shareListModal` | Listagem própria de compartilhamentos |
| Visualização de artigos | `SOCIALBC.viewArticle` | Visualizador próprio de artigo |
| Resposta de formulário | `SOCIALBC.openAnswerForm` | Abertura própria de formulário fora do fluxo nativo |
| Segurança de itens de aprendizado | `LMSBC.elearningsecurity` | UI própria de permissões/restrições de item LMS |

**Como aplicar por intenção:**

- **Pré-review** — quando identificar código customizado **complexo** que replica uma
  dessas funcionalidades (ex.: um modal de seleção de usuários montado à mão com
  consulta ao dataset `colleague`; um cropper de imagem de terceiros; navegação
  própria de documentos do ECM), reportar como achado **Médio** ("Recomendado")
  com a recomendação de substituir pelo componente nativo correspondente, citando
  método e dependência (`application.resource.component.N=<caminho>`). Não é
  violação bloqueante quando o comportamento é legítimo, mas a substituição reduz
  a superfície de erro e melhora a aderência ao padrão da plataforma.
- **Scaffolding** — ao gerar um artefato cuja funcionalidade coincide com um
  componente nativo, **priorizar** a importação e o uso do componente: declarar a
  dependência no `application.info` e invocá-lo dentro do `SuperWidget.extend`, em
  vez de gerar UI/lógica própria.
- **Manutenção** — ao evoluir/refatorar, quando encontrar lógica proprietária
  obsoleta que reimplemente um componente nativo, **guiar a substituição**: remover
  a implementação própria (modal, cropper, seletor) e adotar o componente oficial,
  preservando o comportamento observável e migrando de forma incremental e
  reversível.

**Anti-falso-positivo:**

- `ECMBC.searchDocument` (e os demais `ECMBC.*`/`SOCIALBC.*`/`WCMBC.*`/`LMSBC.*`
  confirmados em [business-components.md](business-components.md)) são **públicos**
  — NUNCA classificar como API interna.
- Não exigir substituição quando o componente nativo **não atende** ao requisito
  (ex.: precisa de colunas/campos que o modal nativo não expõe). Registrar como
  decisão justificada, não como violação.
- **LMS** (`LMSBC.elearningsecurity`) só se aplica a ambientes com LMS presente
  (descontinuado para novas instalações desde 1.6.5-190219) — não sugerir seu uso
  fora desse contexto.

---

## 31. Separação de Responsabilidades no FTL (Widget)

O template FreeMarker (`view.ftl`/`edit.ftl`) do widget é responsável **apenas**
pela marcação — lógica JS e estilos CSS DEVEM residir nos recursos `.js`/`.css`
empacotados e declarados no `application.info` (ver
[Estrutura de pastas e arquivos do widget](architecture.md#estrutura-de-pastas-e-arquivos-do-widget)),
não embutidos no template. A classificação decide pelo **conteúdo real** do bloco,
não pelo padrão sintático isolado
([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)).

| Padrão no FTL | Regra | Severidade |
|---------------|-------|------------|
| `<script>` inline com **lógica** | Funções, manipulação de DOM, chamadas, fluxo embutidos → mover para o `.js` do SuperWidget | Alta |
| `<script>` só com **config curta** FreeMarker | Bloco que apenas expõe um valor de contexto via FreeMarker (não é lógica) | Baixo |
| `<script src="arquivo.js">` (recurso local) | Recursos JS DEVEM ser declarados no `application.info`, não carregados via `<script src>` no FTL. **Exceção:** `/webdesk/vcXMLRPC.js` é permitido (ver [§ 11](#11-exceções-anti-falso-positivo--widgets)) | Alta |
| `<style>` extenso (**> 5 regras**) | O CSS DEVE residir no recurso `.css` empacotado | Alta |
| `<link href="arquivo.css">` | Recursos CSS DEVEM ser declarados no `application.info` | Alta |
| Bundle de **framework** via `<script src>` | Decisão de negócio aceita — distinguir do `<script src>` genérico (ver [§ 27](#27-integração-de-frameworks-front-end-angular--react--vue) e a exceção em [§ 11](#11-exceções-anti-falso-positivo--widgets)) | Não reportar |
| **CDN externo** em FTL (script/estilo apontando para domínio externo) | Recursos DEVEM ser empacotados (ver [§ 5](#5-cdn-externo)) | Crítica |

> **Anti-falso-positivo:** distinguir `<script>` com **lógica** (Alta) de
> `<script>` com apenas **config curta** FreeMarker (Baixo) lendo o conteúdo real;
> `<script src="/webdesk/vcXMLRPC.js">` é a exceção permitida
> ([§ 11](#11-exceções-anti-falso-positivo--widgets)); só apontar `<style>` como
> extenso após **contar** as regras e confirmar que passam de 5.

---

## 32. Metodologia do Relatório de Pré-Review (Contrato Transversal)

Contrato **único e transversal** de como qualquer revisão (`review-*`) produz o seu
relatório. Todas as skills de pré-review **referenciam** esta seção em vez de redefinir
a estrutura do relatório, o contrato de achado ou os rótulos de parecer. É a fonte
de verdade da **forma** do relatório; a **classificação** de severidade por regra
permanece nas seções específicas
([§ 1](#1-license-server-slot-de-licenciamento)–[§ 31](#31-separação-de-responsabilidades-no-ftl-widget)).

### 32.1 Modo somente leitura

A revisão **não altera nem remove** qualquer arquivo de código, configuração ou
descritor do projeto revisado. A **única escrita permitida** no repositório do
parceiro é o **próprio arquivo `.md` de relatório** gerado (ver
[§ 32.10](#3210-persistência-do-relatório-em-arquivo-md)) — nenhum outro arquivo
pode ser criado, modificado ou removido. Vale para todas as intenções de pré-review.

### 32.2 Cobertura 100% e Tracker de Cobertura

A leitura é **integral, sem amostragem**: nenhum arquivo é lido parcialmente e
nenhuma conformidade é afirmada sobre trecho não lido por inteiro. São **proibidas**
frases de leitura parcial ("analisei os principais arquivos", "revisei uma amostra
representativa", "li os trechos mais relevantes").

O relatório traz um **Tracker de Cobertura** — tabela obrigatória com uma linha por
arquivo lido:

| Campo | Conteúdo |
|-------|----------|
| `arquivo` | Caminho relativo do arquivo lido. |
| `linhas` | Total de linhas do arquivo. |
| `lido100` | `✅` (lido por inteiro) \| `❌` (não lido / lido parcialmente). |

Qualquer `❌` no Tracker força o relatório a ser marcado com o rótulo
**"NÃO CONCLUÍDO — Cobertura Incompleta"** e a listar os arquivos não lidos. A
cobertura é 100% ou o relatório é declarado incompleto (princípio já em
[§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)).

### 32.3 Ordem fixa das seções do relatório

O relatório Markdown é **único** e apresentado sempre nesta sequência, sem reordenar
nem omitir seções:

1. **Resumo** — visão geral do artefato revisado, contagem de achados por severidade
   e o Parecer Final antecipado, em **tom colaborativo** ("Identificamos...",
   "Sugerimos...").
2. **Tracker de Cobertura** — a tabela de [§ 32.2](#322-cobertura-100-e-tracker-de-cobertura).
3. **Achados por Severidade** — agrupados da maior para a menor severidade
   (**Crítico → Baixo**).
4. **Pontos Positivos** — práticas corretas observadas.
5. **Plano de Ação Priorizado** — correções sugeridas, das mais urgentes
   (bloqueantes) às de menor prioridade.
6. **Parecer Final** — exatamente um dos rótulos de [§ 32.5](#325-parecer-final).

### 32.4 Contrato de conteúdo de cada achado

Cada achado, dentro da sua faixa de severidade, contém **todos** os campos abaixo. A
escala de severidade em si (Crítico / Alto / Médio / Baixo) e seus critérios **não
são redefinidos aqui** — são as regras específicas
([§ 1](#1-license-server-slot-de-licenciamento)–[§ 31](#31-separação-de-responsabilidades-no-ftl-widget))
e a classificação de App Review ([§ 10](#10-classificação-de-achados--app-review)),
aplicadas por referência.

| Campo | Conteúdo |
|-------|----------|
| `categoria` | Domínio revisado (ex.: Empacotamento EAR, `component.xml`, Dependências Maven, `pages.xml`). |
| `arquivo:linha` | Localização exata do trecho. |
| `severidade` | Faixa classificada segundo a regra específica aplicável ([§ 1](#1-license-server-slot-de-licenciamento)–[§ 31](#31-separação-de-responsabilidades-no-ftl-widget)) — não redefinida aqui. |
| `impacto` | Consequência técnica objetiva do achado. |
| `evidência` | Trecho **real** de código de **3 a 15 linhas** que fundamenta o achado. |
| `recomendação` | Correção segura e acionável; nunca uma sugestão perigosa ([§ 14](#14-recomendações-de-correção-seguras)). |
| `referência` | Caminho + seção de `context/` que fundamenta a regra (sem copiar o texto da regra). |
| `origem` | `base` (achado vindo de skill base delegada) \| `delta` (verificação exclusiva de parceiro). |

O campo `origem` distingue a camada base (delegada) do delta de parceiro e é a chave
para o **portão de deduplicação**
([§ 32.6](#326-portão-de-deduplicação-base--delta)): o mesmo achado nunca é reportado
duas vezes.

### 32.5 Parecer Final

O Parecer Final é sempre **exatamente um** dos três rótulos:

| Rótulo | Quando aplicar |
|--------|----------------|
| **Provável Aprovação** | Nenhum achado bloqueante; o artefato tende a passar. |
| **Atenção** | Há achados relevantes (médios/altos) que convém tratar, sem bloqueio imediato. |
| **Correções Obrigatórias** | Há achado bloqueante (ex.: crítico, ou divergência de versão entre descritores — ver [§ 4](partner-store-conventions.md#4-versionamento-semântico-e-sincronia-de-descritores)) que impede a aprovação até a correção. |

Se o Tracker de Cobertura tiver qualquer `❌`, o relatório é adicionalmente marcado
como **"NÃO CONCLUÍDO — Cobertura Incompleta"**, pois não se conclui aprovação sobre
o que não foi lido por inteiro.

### 32.6 Portão de deduplicação base ↔ delta

Antes de fechar qualquer achado (de `base` ou de `delta`), aplicar o **portão
anti-falso-positivo** ([§ 11](#11-exceções-anti-falso-positivo--widgets) /
[§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)): rastrear a origem
real do valor, respeitar a precedência **exceção > segurança > domínio > genérica** e
**remover duplicações** entre a camada base e o delta. Quando o mesmo achado é
levantado pelas duas camadas, mantém-se um único registro, distinguido pelo campo
`origem`. Origem ambígua vira aviso **"VERIFICAR MANUALMENTE"**
([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)), nunca severidade
inflada.

### 32.7 Aviso de escopo (pré-review não substitui o App Review)

Toda revisão de **um único tipo de artefato ou camada** (ex.: só o componente
Maven, só um widget, só datasets) DEVE incluir, no **Resumo**, um aviso explícito de
que a análise cobre **apenas aquele escopo** e **não garante aprovação na Store**. A
aprovação oficial depende também das verificações de outras camadas — segurança de
código, uso de APIs públicas, performance, acessibilidade — que vivem nas skills de
pré-review específicas de cada artefato.

Exemplo de redação (adaptar ao escopo real):

> Este pré-review cobre **apenas o nível de componente** (projeto Maven, empacotamento
> EAR e descritores). Itens de código de widgets, datasets e eventos (segurança, APIs
> públicas, performance) são avaliados pelas revisões específicas desses artefatos e
> podem reprovar a submissão mesmo que este pré-review passe.

Objetivo: evitar a **falsa sensação de segurança** de que "passou no pré-review de
componente" equivale a "vai passar na Store".

### 32.8 Calibração de severidade (não inflar além do que reprova)

A severidade de cada achado DEVE refletir seu **impacto real na aprovação**, não uma
leitura pessimista. Regras de calibração:

- **Bloqueante (Crítico)** apenas para o que de fato **impede a aprovação/instalação**
  (ex.: divergência de valor de versão entre descritores —
  [§ 4.4](partner-store-conventions.md#44-sincronia-mandatória-de-descritores);
  endpoint de serviço externo sem SSL/TLS —
  [§ 18](#18-ssltls-obrigatório-em-serviços-externos)/[§ 19](#19-falhas-de-segurança-de-acesso);
  credencial exposta — [§ 2](#2-credenciais-e-tokens-expostos)).
- **Boas práticas de build/higiene** que **não** reprovam a submissão (ex.: URL de
  repositório Nexus em `http://`, metadados em `http://`) → Médio/Baixo
  **"VERIFICAR MANUALMENTE"**, nunca Crítico.
- Não elevar a Crítico um achado só porque "parece grave": se não há regra que o
  torne gatilho de reprovação, classificar como Médio/Baixo e sinalizar para
  verificação humana.
- Diante de dúvida sobre o impacto, preferir a **severidade menor** com
  "VERIFICAR MANUALMENTE" a inflar — o excesso de falsos bloqueios reduz a confiança
  no pré-review ([§ 22](#22-análise-contextual-e-heurísticas-anti-falso-positivo)).

### 32.9 Natureza de pré-review (não é aprovação)

Toda skill de pré-review é um **pré-review preparatório**: um passo interno de higiene
que ajuda o parceiro a chegar melhor ao **App Review oficial** da Store.
**Passar no pré-review não significa aprovação** e **não substitui** o App Review
oficial — a decisão de publicação continua sendo exclusiva do processo oficial da
Store.

- O **cabeçalho do relatório** (ver [§ 32.10](#3210-persistência-do-relatório-em-arquivo-md))
  DEVE declarar explicitamente esta condição: que o resultado é um pré-review, que
  não garante aprovação e que não substitui o App Review oficial.
- Esta regra reforça e generaliza o aviso de escopo de
  [§ 32.7](#327-aviso-de-escopo-pré-review-não-substitui-o-app-review): enquanto
  [§ 32.7](#327-aviso-de-escopo-pré-review-não-substitui-o-app-review) trata do escopo
  **parcial** (um único artefato/camada), [§ 32.9](#329-natureza-de-pré-review-não-é-aprovação)
  estabelece que **mesmo uma cobertura ampla** permanece um pré-review, nunca um selo
  de aprovação.

### 32.10 Persistência do relatório em arquivo `.md`

O resultado da revisão **DEVE ser gravado** em um arquivo Markdown na **raiz do
alvo** revisado, nomeado no padrão `pre-review-<artefato>-<AAAA-MM-DD>.md` (ex.:
`pre-review-widget-2026-09-18.md`). Este arquivo é a **única escrita permitida** no
repositório do parceiro ([§ 32.1](#321-modo-somente-leitura)).

O arquivo DEVE começar por um **cabeçalho-resumo** e, em seguida, trazer o
**relatório completo** na ordem fixa de [§ 32.3](#323-ordem-fixa-das-seções-do-relatório).
O cabeçalho contém, no mínimo:

| Campo do cabeçalho | Conteúdo |
|--------------------|----------|
| Marca de pré-review | Declaração de [§ 32.9](#329-natureza-de-pré-review-não-é-aprovação) (é pré-review, não aprova, não substitui o App Review oficial). |
| Escopo | Artefato/camada coberto pela análise (o mesmo escopo do aviso de [§ 32.7](#327-aviso-de-escopo-pré-review-não-substitui-o-app-review)). |
| Parecer | Um dos rótulos de [§ 32.5](#325-parecer-final) (Provável Aprovação / Atenção / Correções Obrigatórias). |
| Contagem por severidade | Total de achados por faixa (Crítico / Alto / Médio / Baixo). |

Depois do cabeçalho, o corpo segue integralmente as seções de
[§ 32.3](#323-ordem-fixa-das-seções-do-relatório) (Resumo, Tracker de Cobertura,
Achados por Severidade, Pontos Positivos, Plano de Ação Priorizado, Parecer Final).

---

## Referências Cruzadas

Esta camada é o **delta de Store** da revisão. Os eixos genéricos e a estrutura de
build vivem na base:

- Convenções específicas da Store: [partner-store-conventions.md](partner-store-conventions.md).
- Arquitetura de provisionamento da Store: [partner-store-architecture.md](partner-store-architecture.md).
- Backend Java/Maven (qualquer persona): [backend-java-maven.md](backend-java-maven.md).
- Convenções gerais de código: [conventions.md](conventions.md).
- Style Guide (FLUIGC, variáveis CSS): [style-guide.md](style-guide.md).
- Componentes de negócio nativos: [business-components.md](business-components.md).
