# Roteamento de Persona

> Fonte única de verdade do pacote para **classificar** o contexto do
> desenvolvedor em uma das duas personas suportadas — **Parceiro (Store)** ou
> **Consultor (Cliente)** — antes de gerar, modernizar ou revisar qualquer
> artefato. A persona é decidida pelo **destino da entrega**, não pelo cargo nem
> pela estrutura do projeto. As regras técnicas invioláveis (ambas as personas)
> vivem em [platform-constitution.md](platform-constitution.md); o modelo de
> projeto Maven multi-módulo exclusivo do parceiro vive em
> [partner-store-architecture.md](partner-store-architecture.md). Skills
> referenciam este arquivo em vez de duplicar a cascata de classificação.

## As duas personas

| Persona | Quem é (pelo destino) | O que carrega |
|---------|------------------------|----------------|
| **Consultor (Cliente)** | Desenvolve uma solução exclusiva para uma empresa (empregador ou cliente), sem publicar na Store | Core: [architecture.md](architecture.md), [conventions.md](conventions.md), [conventions-form.md](conventions-form.md), [processo-bpm.md](processo-bpm.md), [style-guide.md](style-guide.md), [technologies.md](technologies.md), [business-components.md](business-components.md), [datasets-nativos.md](datasets-nativos.md), [backend-java-maven.md](backend-java-maven.md) (quando a estrutura for Maven/Java), [writing-style-guide.md](writing-style-guide.md), [references/](references/) + [platform-constitution.md](platform-constitution.md) |
| **Parceiro (Store)** | Desenvolve um produto para oferecer a diferentes empresas, com publicação na Store do TOTVS Fluig (App Review) | Tudo o que o Consultor carrega **+** [partner-store-architecture.md](partner-store-architecture.md), [partner-store-conventions.md](partner-store-conventions.md), [backend-java-maven.md](backend-java-maven.md), [partner-store-review-rules.md](partner-store-review-rules.md) |

O **cargo** sozinho ("sou parceiro", "sou consultor") **não** decide: vale como
dica, mas quem decide é o destino. Isso evita o erro silencioso do parceiro que
faz uma customização para um único cliente e seria classificado como Store sem
precisar.

A referência estrutural de projeto parceiro é o `sample-component` publicado
pela TOTVS em
[totvs/fluig-samples](https://github.com/totvs/fluig-samples/tree/master/partners-samples/sample-component)
(citado aqui apenas como texto; o detalhe estrutural vive em
[partner-store-architecture.md](partner-store-architecture.md)).

## Precedência

```text
conversa (Passo 1)  >  marcador de arquivo (Passo 2)  >  marcador técnico de Store (Passo 3)  >  estrutura do projeto (Passo 4)  >  pergunta de 3 opções (Passo 5)
```

Uma declaração de destino na conversa sempre vence os demais passos. O marcador
de arquivo vence os Passos 3 e 4 **mesmo quando discorda deles** — conflito não é
ambiguidade. O marcador técnico de Store (Passo 3) classifica como Parceiro de
forma exclusiva. A estrutura do projeto (Passo 4) só decide quando os Passos 1–3
não resolveram, e sem marcador técnico ela nunca decide Parceiro. Se mesmo assim
restar ambiguidade, pergunta-se (Passo 5).

Antes de executar qualquer geração, modernização ou revisão, emita a linha:

```text
Persona: <Parceiro|Consultor> (motivo)
```

O motivo cita o **destino** ou o **marcador** que decidiu a persona. Nas skills de
scaffolding e na `fluig-code-review-partner-component`, essa linha é precedida por
`Estrutura: <Studio|Maven|Híbrida> (motivo)`.

## Passo 1 — Destino declarado na conversa (prioridade máxima)

Leia a conversa com as mesmas 3 categorias da pergunta do Passo 5:

- Expressões de **destino da opção 1** (ex.: "para o meu cliente", "para a empresa
  onde trabalho", "customização", "projeto de implantação", "no cliente") →
  **Consultor**.
- Expressões de **destino da opção 2** (ex.: "publicar na Store", "App Review",
  "produto para comercializar", "oferecer a várias empresas") → **Parceiro**.

O **cargo** sozinho não decide: vale como dica, e a cascata continua.

## Passo 2 — Marcador de arquivo na raiz

| Arquivo na raiz do projeto | Classificação |
|------------------------------|----------------|
| `.fluig-partner` | **Parceiro** |
| `.fluig-consultant` | **Consultor** |

O marcador vence os Passos 3 e 4 mesmo quando discorda deles: conflito não é
ambiguidade.

## Passo 3 — Marcador técnico de Store (exclusivo)

Classifica como **Parceiro** — e **só** a Store tem estes sinais:

- `component.xml` em qualquer ponto do projeto (tipicamente
  `src/main/resources/` ou `.../META-INF/`), ignorando `target/`, `node_modules/`
  e `.git/`;
- consumo de `/license/api/v1/slots/` no código (API de validação de slotID do
  License Server).

A **presença** do marcador decide; se o preenchimento está correto é assunto de
review, não de roteamento. **Nenhum outro sinal** decide a persona: empacotamento
EAR, módulo `*-pack`, POM multi-módulo, repositório Nexus, `fluig-api-tools`,
AppDS, módulo `*-wizard`, `simple.deploy` e o security-domain TOTVSTech apenas
**descrevem a estrutura** do projeto (ver a seção "Detecção de estrutura do
projeto" de [architecture.md](architecture.md#detecção-de-estrutura-do-projeto)).

## Passo 4 — Estrutura do projeto

- Estrutura **Studio** sem `pom.xml` na raiz → **Consultor**. Isso inclui o
  híbrido com agregador em `wcm/widget/pom.xml` (ex.: kit-intranet).
- Estrutura **Maven** com `pom.xml` na raiz e **sem marcador técnico** → Passo 5
  (ambíguo até perguntar). A estrutura Maven não define a persona: um Consultor
  também pode entregar um projeto Maven multi-módulo com EAR.

## Passo 5 — Pergunta de 3 opções (fallback)

Vale para diretório vazio (projeto do zero), snippet de código sem projeto no
chat e projeto Maven sem marcador técnico. **Pare e pergunte** exatamente este
cabeçalho e estas 3 opções:

> Para aplicarmos as regras corretas, qual destas opções descreve o destino
> deste desenvolvimento?
>
> 1. "Uma solução exclusiva para uma empresa: Sou colaborador, analista ou
>    consultor e desenvolvo para atender às necessidades dessa empresa. Exemplo:
>    criar um processo de compras para meu empregador ou cliente." → **Consultor**
> 2. "Um produto para oferecer a diferentes empresas: Sou um parceiro e
>    desenvolvo ou mantenho uma solução que minha empresa oferece como produto
>    aos clientes. Exemplo: criar um aplicativo de dashboard para
>    comercialização." → **Parceiro**
> 3. "Não tenho certeza: Preciso de ajuda para identificar meu cenário." →
>    perguntas de apoio sobre o destino; depois, classificar.

- **Opção 3** → faça perguntas de apoio sobre o destino (ex.: "A solução vai ser
  publicada na Store do TOTVS Fluig?", "Vai ser oferecida como produto a mais de
  uma empresa?") e depois classifique entre Consultor e Parceiro.
- Junto da pergunta, **ofereça criar o marcador** (`.fluig-partner` ou
  `.fluig-consultant`) na raiz do projeto para fixar a classificação em
  desenvolvimentos futuros. Enquanto a resposta não chega, mantenha a
  classificação **apenas na sessão atual** — não assuma persona por padrão e
  nenhuma skill executa.

## O que cada persona carrega

- **Consultor** carrega o **core**: [architecture.md](architecture.md),
  [conventions.md](conventions.md), [conventions-form.md](conventions-form.md)
  (convenções e eventos de formulário), [processo-bpm.md](processo-bpm.md)
  (eventos de processo/BPM, `hAPI`, `customHTML`),
  [style-guide.md](style-guide.md), [technologies.md](technologies.md),
  [business-components.md](business-components.md),
  [datasets-nativos.md](datasets-nativos.md),
  [backend-java-maven.md](backend-java-maven.md) (backend Java e projeto Maven
  multi-módulo — carregado **quando a estrutura do projeto for Maven** ou houver
  backend Java),
  [writing-style-guide.md](writing-style-guide.md) (terminologia oficial TOTVS
  para textos ao usuário), [references/](references/) (ícones Flaticon,
  layouts nativos) e a
  [platform-constitution.md](platform-constitution.md) (regras invioláveis de
  plataforma, válidas para todos).
- **Parceiro** carrega **tudo o que o Consultor carrega** mais a camada de
  Store: [partner-store-architecture.md](partner-store-architecture.md),
  [partner-store-conventions.md](partner-store-conventions.md),
  [backend-java-maven.md](backend-java-maven.md) e
  [partner-store-review-rules.md](partner-store-review-rules.md).

## Nunca misture

**Nunca** aplique as regras exclusivas da Store no código de um Consultor. São
elas: o **prefixo de parceiro** (namespacing), o **`component.xml`**, a
**validação de licença/slot** (`/license/api/v1/slots/`) e o **relatório de
pré-review persistido**. Empacotamento EAR e `simple.deploy` são **estruturais**
(descrevem o projeto, não a persona) e podem aparecer num projeto Maven de
Consultor. O inverso — aplicar só o core a um Parceiro — deixa o componente fora
de conformidade para o App Review.

## Referências Cruzadas

- Regras técnicas invioláveis de toda customização Fluig:
  [platform-constitution.md](platform-constitution.md).
- Modelo de projeto Maven multi-módulo do parceiro:
  [partner-store-architecture.md](partner-store-architecture.md).
- Detecção de estrutura do projeto (Studio, Maven, híbrida):
  [architecture.md](architecture.md#detecção-de-estrutura-do-projeto).
- Prefixo de parceiro (namespacing): [§ 6](partner-store-conventions.md#6-namespacing-e-isolamento-de-artefatos-prefixo-de-parceiro).
