# Arquitetura da Solução para a Store do TOTVS Fluig (Parceiro)

> **Delta sobre a base.** Este arquivo documenta exclusivamente a **arquitetura de
> provisionamento específica da Store**: o módulo `config` (`component.xml`/`pages.xml`),
> o ciclo de provisionamento e parametrização via Wizard, o motor dinâmico de
> provisionamento por introspecção e o uso do `ActivationListener` na Store (vínculo
> `activationClass` ↔ `component.xml` e credencial via Keyring). A estrutura genérica
> do **projeto Maven multi-módulo** (modelo de módulos, nomenclatura de diretórios,
> empacotamento EAR, POM raiz/herança) e o **contrato Java do `ActivationListener`**
> são fonte de verdade em [backend-java-maven.md](backend-java-maven.md). A
> **estrutura interna** dos artefatos (widget, layout, form, dataset), seus
> descritores e pontos de extensão públicos permanecem em
> [architecture.md](architecture.md). Para **convenções específicas da Store**, veja
> [partner-store-conventions.md](partner-store-conventions.md); para **regras de
> review da Store**, veja [partner-store-review-rules.md](partner-store-review-rules.md).

---

## Quando se aplica

Somente quando o **destino da entrega é a Store** (persona Parceiro — detecção por
marcador técnico de Store conforme [persona-routing.md](persona-routing.md): presença
de `component.xml` ou consumo da API de validação de slot). Uma solução entregue a
uma única empresa (persona Consultor) **não** carrega esta camada: se for projeto
Maven, ela usa [backend-java-maven.md](backend-java-maven.md) para estrutura e
empacotamento, sem o módulo `config` da Store nem o ciclo de provisionamento abaixo.

---

## Módulo config: `component.xml` e `pages.xml`

O módulo **config** (`<packaging>war</packaging>`, obrigatório na solução de Store)
é a **identidade da solução** publicada: concentra o `component.xml` (metadados de
publicação na Store), o `pages.xml` (árvore de páginas), a navegação e os datasets de
deploy. É esse módulo que distingue uma solução destinada à Store de um projeto Maven
genérico — em um projeto Maven de Consultor, `config` **não** é exigido.

| Descritor | Papel | Localização |
|-----------|-------|-------------|
| `component.xml` | Identidade do app na Store (code, title, version, developer, category) e, quando há ativação, `<activationClass>` | `{artifactId}-config/src/main/resources/component.xml` |
| `pages.xml` | Árvore de páginas publicadas — uma página raiz agrupadora e filhas coerentes por `parentCode` | `{artifactId}-config/src/main/resources/pages.xml` |

As regras de conteúdo e integridade desses descritores são regras de **review** —
veja [§ 6](partner-store-review-rules.md#6-componentxml) (`component.xml`) e
[§ 6.1](partner-store-review-rules.md#61-pagesxml--estrutura-unicidade-e-coerência-da-hierarquia)
(`pages.xml`). A imutabilidade do `<code>` após a publicação é convenção —
[§ 4.5](partner-store-conventions.md#45-imutabilidade-do-code-do-componentxml).

---

## Ciclo de Provisionamento e Parametrização via Wizard

> **Padrão-ouro da solução de Store.** Esta seção é a **fonte única de verdade** do
> ciclo que conecta três peças: o **Formulário Parametrizador** (estratégia
> Formulário + Dataset — ver
> [Estratégia de Persistência (Formulário/Dataset vs Entity)](backend-java-maven.md#estratégia-de-persistência-formuláriodataset-vs-entity)),
> o **empacotamento no EAR** (módulo pack — ver
> [Empacotamento EAR (Módulo Pack)](backend-java-maven.md#empacotamento-ear-módulo-pack))
> e a **instalação idempotente pelo Wizard** (módulo wizard). As skills de parceiro
> **referenciam** esta seção por caminho relativo — nunca duplicam seu conteúdo.

### Problema que o ciclo resolve

Quando um aplicativo precisa de parâmetros que dependem do ambiente do cliente
(URLs de integração, pastas de publicação, periodicidades, limiares, papéis e
grupos), esses valores **não podem** ser fixos no código
([Sem valores fixos de ambiente](conventions.md#sem-valores-fixos-de-ambiente);
[§ 16](partner-store-review-rules.md#16-valores-fixos-de-ambiente-hardcode-proibido)
e [§ 17](partner-store-review-rules.md#17-parametrização-configurações-alteráveis)).
A boa prática é **externalizar a parametrização** para um artefato configurável pelo
cliente e **provisioná-lo automaticamente** na instalação — sem depender de passos
manuais no ambiente de destino.

### As três peças do ciclo

| Peça | Papel | Onde vive |
|------|-------|-----------|
| **1. Formulário Parametrizador** | Guarda os parâmetros editáveis pelo cliente (um registro de configuração por tenant). Preferir Formulário + Dataset ao invés de entity | Recurso do Fluig, exportado como **ZIP** |
| **2. Recurso empacotado no EAR** | O ZIP do formulário (e outros recursos: papéis, grupos, processos, datasets) é embarcado no artefato, não fica solto no ambiente do cliente | Dentro do módulo **pack** (EAR) |
| **3. Wizard de instalação idempotente** | Na primeira execução, verifica → cria/importa o que faltar → dá feedback. Reexecutar não duplica nada | Módulo **wizard** (WAR, SuperWidget) |

> Para **quais blocos do Style Guide** compor na UI do Wizard (stepper, containers de
> step, navegação, banner de status), ver
> [Vocabulário de componentes para Wizards de instalação](style-guide.md#vocabulário-de-componentes-para-wizards-de-instalação)
> em `style-guide.md` — este ciclo trata do processo/lógica de provisionamento, não
> da composição visual.

### Fluxo canônico

```text
Formulário Parametrizador   →   ZIP embarcado no EAR   →   Wizard instala de forma idempotente
(parâmetros editáveis)          (módulo pack)               (verifica → cria/importa → feedback)
```

1. **Formulário Parametrizador.** O parâmetro dinâmico é modelado como um
   formulário de configuração (estratégia preferida Formulário + Dataset — ver
   [Estratégia de Persistência (Formulário/Dataset vs Entity)](backend-java-maven.md#estratégia-de-persistência-formuláriodataset-vs-entity)).
   O código do componente lê os valores desse dataset em runtime, nunca de literais.
2. **Empacotamento no EAR.** O formulário exportado (ZIP) e demais recursos
   provisionáveis (papéis, grupos, processos, datasets) são **embarcados no pacote**
   (módulo pack). Recursos soltos na raiz do entregável fora do EAR são achado
   Crítico — **salvo** quando há um wizard que os empacota e instala via API pública
   (ver [§ 28](partner-store-review-rules.md#28-java-build-e-empacotamento--exigências-da-store)).
3. **Instalação idempotente pelo Wizard.** O wizard executa o loop
   **verificação → instalação → feedback**: antes de criar um papel/grupo ou importar
   o ZIP do formulário, **consulta via API/Dataset se o recurso já existe**; só
   cria/importa o que faltar. Conflito de recurso já existente (ex.: HTTP 409) é
   tratado como **sucesso**, não como erro.

### Idempotência — regra do ciclo

O wizard **deve** ser reexecutável sem gerar duplicidade. Para cada recurso
provisionado:

| Recurso | Verificação antes de criar/importar | Idempotência |
|---------|-------------------------------------|--------------|
| **Formulário (ZIP)** | Consultar se o dataset/documento do formulário já existe | Se existe, não reimportar |
| **Papel** | Consultar se o papel já existe | Se existe, não recriar |
| **Grupo** | Consultar se o grupo já existe | Se existe, não recriar |
| **Processo / Dataset / Serviço** | Consultar existência pelo identificador | Se existe, pular criação |

> **Regra:** "verificar antes de instalar" e "conflito = sucesso" são invariáveis
> do ciclo. Provisionar sem checar existência (criação cega) é violação — gera
> registros duplicados a cada reinstalação. As APIs públicas de provisionamento
> por tipo (pasta, formulário, grupo, processo, dataset, serviço, registro) e a
> hierarquia de dependências entre recursos seguem as convenções de wizard já
> referenciadas pelas skills.

### Padrão Técnico de Instalação em Lote (CRUD do Wizard)

O loop **verificação → instalação → feedback** descrito acima tem um padrão
técnico recomendado para a implementação do passo de provisionamento,
especialmente quando há múltiplos recursos a instalar no mesmo passo:

1. Ao disparar a instalação, **desabilitar o botão/ação de trigger** — evita
   disparo duplo durante o processamento.
2. Fazer **uma única chamada em lote/prefetch** que verifica de uma vez o
   status de instalação de **todos** os recursos do passo — evitar o padrão
   N+1 (uma chamada de verificação por item, em sequência ou loop) é boa
   prática de performance.
3. Para cada item do lote: se já instalado, pular; caso contrário, exibir um
   indicador de carregamento por item (pode usar `FLUIGC.loading`), disparar
   a chamada de instalação, e então exibir um badge/toast de sucesso ou falha
   específico para aquele item.
4. Ao final do lote, **reabilitar o botão/ação de trigger** e exibir um
   toast-resumo (ex.: "X de Y recursos instalados com sucesso").
5. Tratar falha de instalação com **retry** (reexecutar a chamada apenas para
   o item que falhou) e uma **mensagem de fallback** clara quando a chamada
   de instalação falhar de forma persistente.

A operação de **desinstalar** o recurso é **recomendada para simetria com a
instalação** (ciclo de vida completo instalar/desinstalar) — como boa prática de
simetria a adotar quando o cenário do componente justificar reverter o
provisionamento.

### Motor Dinâmico de Provisionamento por Introspecção

> **Fonte única de verdade do comportamento dinâmico do Wizard.** O Wizard é
> **100% dinâmico e orientado a introspecção de dependências**. É **PROIBIDO**
> gerar passos fixos para recursos que o aplicativo **não possui**. O conjunto de
> etapas do Wizard **não é uma lista estática**: é um **array de passos ativos**
> montado em tempo de execução a partir da varredura dos artefatos reais do
> projeto.

#### Regra da introspecção dinâmica

A Skill / IA analisa dinamicamente os artefatos do aplicativo para construir o
**manifesto de dependências**. Cada passo intermediário de provisionamento só
entra no Wizard **se o recurso correspondente for detectado**:

| Recurso detectado na varredura | Etapa incluída | Se ausente |
|--------------------------------|----------------|-----------|
| Módulo/endpoints REST (`{artifactId}-rest`, serviço consumido) | Etapa de configuração/health de serviço REST | **Não** gerar etapa de serviço REST |
| Papéis/grupos customizados a provisionar | Etapa de criação de grupos/papéis | **Não** gerar etapa de grupos/papéis |
| Chaves/parâmetros externos a coletar do cliente | Formulário de entrada manual | **Não** exibir formulário de entrada |
| Formulário Parametrizador (ZIP no pack) | Etapa de importação idempotente do ZIP | **Não** gerar etapa de importação |
| Processos / datasets / pastas provisionáveis | Etapa de provisionamento do tipo detectado | **Não** gerar a etapa |

#### Etapas universais (únicas obrigatórias)

Apenas **duas** etapas são sempre incluídas, independentemente da introspecção:

1. **Consentimento/Status (LGPD/Termos)** — no início do fluxo.
2. **Health-Check final** — validação de conformidade ao término.

A etapa de Consentimento/Status, além de reportar o status de provisionamento,
**deve apresentar o aceite de Termos de Uso/Política de Privacidade da solução** e
**bloquear o avanço** para as etapas seguintes do wizard até o aceite ser
confirmado (ex.: manter desabilitado o link "Next" do Pager, ou o
`footerActions.nextStep` quando a composição usar `FLUIGC.wizardModal`, enquanto o
checkbox/ação de aceite não for marcado). O **registro do aceite** (quem aceitou e
quando) deve ser persistido, reaproveitando o modelo padrão de persistência do
pacote (Formulário + Dataset, não Entity — ver
[Estratégia de Persistência (Formulário/Dataset vs Entity)](backend-java-maven.md#estratégia-de-persistência-formuláriodataset-vs-entity)).
Após a conclusão do onboarding, o aceite registrado deve permanecer **acessível
para consulta posterior** — como opções (não um mandato único): um link no rodapé,
um link no cabeçalho, ou uma página dedicada registrada em `pages.xml`.

> **Diferença de nível com
> [§ 3](partner-store-review-rules.md#3-termos-de-uso-e-política-de-privacidade):**
> aquela seção exige a **disponibilização** de Termos de Uso/Política de
> Privacidade no nível do documento/aplicação (requisito de App Review). Esta
> subseção aplica essa mesma exigência **no nível do passo do wizard** —
> apresentação do aceite + bloqueio de avanço + persistência do registro +
> reexibição posterior — sem duplicar o texto de
> [§ 3](partner-store-review-rules.md#3-termos-de-uso-e-política-de-privacidade).

**Todas as etapas intermediárias de provisionamento** são condicionais: entram
somente quando o recurso é detectado na varredura. Passos fixos para recursos
inexistentes são **etapas mortas/fantasma** — proibidas.

#### Lógica do motor (varredura → montagem → execução)

```text
1. Introspecção do Projeto
   └─ varrer POM raiz + módulos + recursos embarcados no pack (EAR)
      → detectar: REST? papéis/grupos? chaves externas? ZIP de formulário?
        processos? datasets? pastas?

2. Montagem do Array de Passos Ativos
   └─ iniciar com [Consentimento/Status]
      → para cada recurso DETECTADO, injetar condicionalmente seu passo
      → finalizar com [Health-Check]
   → resultado: lista de passos = apenas etapas universais + recursos reais

3. Execução Idempotente (apenas dos recursos existentes)
   └─ para cada passo ativo: verificação → instalação → feedback
      → conflito de recurso existente (ex.: HTTP 409) = sucesso
      → nunca executar passo de recurso que não existe no projeto
```

> **Regra do motor dinâmico:** o Wizard nunca declara passos de provisionamento
> "por precaução". A presença de cada etapa intermediária é **derivada** da
> introspecção; a ausência do recurso implica a ausência da etapa.

### Reuso de componentes de negócio nativos

Para ações que a plataforma já resolve (seleção de usuários/grupos/papéis, etc.),
priorizar os componentes de negócio nativos de
[business-components.md](business-components.md) — não recriar pickers ou fluxos
manuais dentro do wizard. Em particular, qualquer passo do wizard que precise
coletar/selecionar um usuário, grupo, papel ou documento **deve** reutilizar os
pickers nativos `WCMBC.selectUser`, `WCMBC.selectGroup`, `WCMBC.selectRole` e
`ECMBC.searchDocument` (assinaturas completas em
[business-components.md](business-components.md)), em vez de recriar um
modal/picker próprio para essa finalidade. A regra de review correspondente é
[§ 30](partner-store-review-rules.md#30-reuso-de-componentes-de-negócio-nativos).

### ActivationListener na Store (`activationClass` e Keyring)

> **Segunda rota do mesmo ciclo.** O `ActivationListener` é uma **rota
> alternativa** ao Wizard client-side para provisionar formulário/dataset na
> instalação. O **contrato Java** (classe EJB, os 4 métodos, `mappedName`/`name`)
> e o **padrão de `install()`** são fonte de verdade em
> [Provisionamento via Eventos de Componente (`ActivationListener`)](backend-java-maven.md#provisionamento-via-eventos-de-componente-activationlistener).
> Esta subseção documenta o **vínculo específico com a Store**: quando escolher cada
> rota, o vínculo com o `component.xml` e o provisionamento de credencial via Keyring.

#### Critério de decisão (Wizard × ActivationListener)

| Situação | Rota |
|----------|------|
| **Sem interação do usuário**; o dado/seed já é conhecido em tempo de build | `ActivationListener.install()` |
| **Usuário precisa decidir/informar** algo (URL, pasta, periodicidade, credencial de ambiente) | Wizard client-side |

#### Vínculo `activationClass` ↔ `component.xml`

A ativação é declarada em **dois** descritores do módulo config, com o **mesmo
identificador** `activator/<component_code>` (o `name` da anotação da classe de
ativação — **não** o FQN da classe Java):

- No `application.info`: `activation.class=activator/<component_code>` — e
  tipicamente `simple.deploy=false`.
- No `component.xml`: `<activationClass>activator/<component_code></activationClass>`.

Os dois **coexistem** e DEVEM carregar exatamente o mesmo valor `activator/<code>`;
divergência entre eles é achado. A divergência de **escopo do EJB** entre exemplos
observados — kit com `@Singleton` e o padrão exigido `@Stateless` + `@Remote` — fica
registrada como **VERIFICAR** (o contrato recomendado está em
[Contrato Java (conciso)](backend-java-maven.md#contrato-java-conciso)).

#### Provisionamento de credencial via Keyring em `enable()`

**Terceiro uso do mesmo contrato**, distinto do provisionamento de formulário/
dataset de `install()`: `enable()` pode chamar `Keyring.provision(APP_KEY)`
(`com.fluig.customappkey.Keyring`, do artefato `fluig-sdk-keyring`) para que a
plataforma gere e armazene, de forma segura, as credenciais OAuth 1.0 (consumer
key/secret, token/token secret) associadas ao componente.

`APP_KEY` **não é um segredo** — é um identificador de busca (formato
`XXXX-XXXX-XXXX-XXXX`), escolhido pelo próprio parceiro, que diz ao Keyring **qual**
entrada do cofre provisionar/consultar. É análogo ao `serviceCode` do Cadastro de
Serviços: vazar esse valor não concede acesso a nada por si só — por isso **é seguro
declará-lo como constante no fonte Java**. Isso contrasta com um segredo real
(consumer secret, token, senha, chave de API), que **nunca** pode ser hardcoded: as
credenciais de fato são geradas e armazenadas pelo Keyring e obtidas em tempo de
execução via `Keyring.getKeys(tenantId, APP_KEY)`, que retorna um `KeyVO`
(`com.fluig.sdk.api.customappkey.KeyVO`).

Esse padrão é útil quando uma **página pública/anônima** (sem usuário autenticado)
precisa de dado protegido da plataforma: a própria camada REST do componente (nunca
o navegador) chama `Keyring.getKeys` para obter o `KeyVO`, monta um
`DefaultOAuthConsumer` (signpost) e assina a chamada a uma API pública do Fluig.
Nenhuma credencial chega ao navegador nem ao fonte Java.

---

## Aplicação no Triângulo de Ferro

As três frentes herdam **esta mesma** regra (sem duplicá-la):

- **Pré-review** — ao detectar valor dependente de ambiente fixo no código
  ([§ 16](partner-store-review-rules.md#16-valores-fixos-de-ambiente-hardcode-proibido)/[§ 17](partner-store-review-rules.md#17-parametrização-configurações-alteráveis)),
  a recomendação de correção orienta externalizar o valor para um **Formulário
  Parametrizador** instalado via Wizard, conforme este ciclo. Além disso, a presença
  de **etapas mortas/fantasma** (passo de provisionamento para recurso que o app não
  possui) é **Falha de Design** (severidade Média/Baixa), por violar o *Motor
  Dinâmico de Provisionamento por Introspecção*.
- **Scaffolding** — a geração do wizard nasce com **estrutura orientada a módulos
  dinâmicos**: os passos de provisionamento são **injetados condicionalmente**
  conforme as dependências reais detectadas na introspecção do projeto, e as rotinas
  base de checagem/criação de papéis e grupos e de importação de ZIP de formulário
  nascem **idempotentes**, conforme este ciclo e o *Motor Dinâmico*.
- **Modernize** — ao refatorar código com valores fixos, a evolução orquestra a
  extração do dado para um Formulário, o empacotamento do ZIP no pack (EAR) e a
  adição da rotina de instalação idempotente no Wizard, sem regressão. Wizards
  **engessados** (passos fixos independentes do que o app possui) são refatorados
  para o **modelo dinâmico baseado em introspecção**, removendo etapas fantasma e
  injetando os passos apenas para os recursos reais.

---

## Referências Cruzadas

Esta camada é o **delta de Store** da arquitetura. A base genérica vive em:

- Projeto Maven multi-módulo e contrato Java do `ActivationListener`: [backend-java-maven.md](backend-java-maven.md).
- Estrutura interna dos artefatos e descritores: [architecture.md](architecture.md).
- Convenções específicas da Store: [partner-store-conventions.md](partner-store-conventions.md).
- Regras de review da Store: [partner-store-review-rules.md](partner-store-review-rules.md).
- Style Guide (vocabulário de wizard): [style-guide.md](style-guide.md).
- Componentes de negócio nativos: [business-components.md](business-components.md).
