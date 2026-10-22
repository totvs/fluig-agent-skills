# Backend Java e Projeto Maven Multi-Módulo

> Fonte única de verdade do pacote para o **backend Java** e para o **projeto
> Maven multi-módulo** de customizações Fluig: estrutura de módulos,
> empacotamento EAR, dependências/plugins Maven, repositório, JNDI,
> `ServiceLocator`, DAO, persistência, multi-tenant, log, respostas REST e i18n
> na camada Java. Este conteúdo é **genérico** e vale para **qualquer persona** —
> um Consultor que entrega para uma única empresa também pode usar Maven/EAR, e um
> backend Java pode existir sem estrutura Maven. Para a estrutura interna dos
> artefatos (widget, layout, form, dataset) e a detecção de estrutura do projeto,
> veja [architecture.md](architecture.md). Para convenções de frontend (JavaScript,
> FreeMarker, CSS, i18n client-side), veja [conventions.md](conventions.md). Para
> tecnologias client-side, veja [technologies.md](technologies.md).

## Quando se aplica

Use este arquivo sempre que o projeto tiver **estrutura Maven** (`pom.xml`,
módulos, empacotamento EAR) **ou** um **backend Java** (módulos de persistência,
serviço EJB ou endpoints REST), **independentemente da persona**. A estrutura
Maven e a presença de código Java **não** definem a persona (ver a seção
"Detecção de estrutura do projeto" em [architecture.md](architecture.md)): elas
descrevem *como o projeto é empacotado e deployado*, não *para onde a entrega
vai*.

> **Java não é exclusivo de Maven.** Um backend Java pode ser organizado com ou
> sem o modelo Maven multi-módulo descrito abaixo. As convenções de código Java
> (JNDI, `ServiceLocator`, DAO, multi-tenant, log, respostas REST, i18n em
> `ResourceBundle`) valem para qualquer backend Java do Fluig; a parte de
> estrutura de módulos e empacotamento EAR aplica-se apenas quando o projeto
> **de fato** adota o modelo Maven multi-módulo.

> **Parceiro (Store):** as exigências de **publicação na Store** sobre este mesmo
> material (campos de `application.info` exigidos pela Store, prefixo de parceiro,
> vínculo com `component.xml`, checklist de App Review) vivem na camada de Store —
> [partner-store-architecture.md](partner-store-architecture.md),
> [partner-store-conventions.md](partner-store-conventions.md) e
> [partner-store-review-rules.md](partner-store-review-rules.md). Carregue-as **somente**
> quando a persona for Parceiro.

---

## Visão Geral do Projeto Maven Multi-Módulo

Um projeto Maven multi-módulo organiza a customização como um **POM raiz**
(`<packaging>pom</packaging>`) que agrega subdiretórios — cada um um módulo com
packaging próprio (WAR, EJB, JAR ou EAR). O resultado final do build é um **EAR**
(Enterprise Archive) que agrupa todos os módulos para deploy no servidor Fluig
(JBoss/WildFly).

Esse modelo é opcional e estrutural: ele descreve o empacotamento, não a persona.

---

## Modelo Conceitual de Módulos

| Módulo | Packaging | Papel |
|--------|-----------|-------|
| **config** | `war` | Identidade da solução: descritores de deploy, navegação, datasets de deploy |
| **pack** | `ear` | Agregador final — empacota todos os demais módulos para deploy |
| **widget** | `war` | Componente visual (SuperWidget) — um módulo por widget |
| **layout** | `war` | Template de página com slots — um módulo por layout |
| **entity** | `jar` | Entidades JPA (persistência relacional) |
| **service** | `ejb` | Lógica de negócio server-side (EJB `@Stateless`) |
| **rest** | `war` | Endpoints JAX-RS expostos ao frontend |
| **wizard** | `war` | Widget de instalação/configuração inicial |

> **Obrigatoriedade estrutural:** em um projeto multi-módulo com EAR, o módulo
> **pack** é obrigatório (é ele que gera o EAR). Os demais módulos são incluídos
> conforme a necessidade da solução.

> **Parceiro (Store):** o módulo **config** (que carrega `component.xml` e
> `pages.xml`) é um requisito do fluxo de publicação na Store — ver
> [partner-store-architecture.md](partner-store-architecture.md). Fora da Store, a identidade
> da solução não depende de `component.xml`.

> **Matriz de Escolha de Persistência — entity/service como exceção.** Os módulos
> **entity** (JPA) e **service** (EJB) são o caminho de **exceção justificada** de
> persistência, **não** o caminho padrão. O modelo padrão e recomendado de
> persistir dados de negócio é **Formulário + Dataset** (ver "Estratégia de
> Persistência" abaixo).

---

## Convenção de Nomenclatura de Diretórios

Cada módulo vive em um subdiretório do projeto raiz, nomeado conforme:

```
{artifactId}-{tipo}
```

Onde `{artifactId}` é o identificador base do projeto e `{tipo}` é o sufixo que
identifica o papel do módulo.

**Exemplos** (para `artifactId = minha-solucao`):

| Módulo | Diretório |
|--------|-----------|
| config | `minha-solucao-config` |
| pack | `minha-solucao-pack` |
| widget (único) | `minha-solucao-widget` |
| widget (múltiplos) | `minha-solucao-widget-{nome}` |
| layout (único) | `minha-solucao-layout` |
| layout (múltiplos) | `minha-solucao-layout-{nome}` |
| entity | `minha-solucao-entity` |
| service | `minha-solucao-service` |
| rest | `minha-solucao-rest` |
| wizard | `minha-solucao-wizard` |

> **Múltiplos widgets/layouts:** quando o projeto contém mais de um widget (ou
> layout), cada um ganha um sufixo descritivo após `-widget-` (ou `-layout-`).
> Exemplo: `minha-solucao-widget-dashboard`, `minha-solucao-widget-config`.

---

## Estrutura de Diretórios: Maven vs Studio

O modelo Maven multi-módulo difere do modelo Fluig Studio em organização física,
embora a **estrutura interna** de cada artefato seja a mesma:

| Aspecto | Projeto Studio | Projeto Maven Multi-Módulo |
|---------|---------------|---------------------------|
| Organização | Pasta única com subpastas por tipo (`wcm/widget/`, `wcm/layout/`, `datasets/`) | Cada artefato é um **módulo Maven** independente com `pom.xml` próprio |
| Widget | `wcm/widget/{nome}/` | `{artifactId}-widget/src/main/resources/` e `src/main/webapp/` |
| Layout | `wcm/layout/{nome}/` | `{artifactId}-layout/src/main/resources/` e `src/main/webapp/` |
| Build | Export pela ferramenta de desenvolvimento | `mvn clean install` na raiz → gera EAR no módulo pack |
| Deploy | Upload direto pela ferramenta de desenvolvimento | Upload do `.ear` gerado pelo pack |
| Backend (Java) | Artefatos JavaScript server-side (datasets, eventos) na própria estrutura | Módulos entity, service, rest com código Java |

> A **estrutura interna dos artefatos** (posição de `application.info`,
> `view.ftl`/`layout.ftl`, i18n, JS, CSS, `WEB-INF/`) é idêntica nos dois modelos.
> Veja [architecture.md](architecture.md) para os detalhes completos.

> **Correção de modelos anteriores:** a linha "Backend (Java) → Não suportado"
> para o Studio está **incorreta**. O que distingue os dois modelos é a forma de
> organizar e compilar o código Java (módulos Maven `entity`/`service`/`rest`
> versus artefatos server-side na estrutura Studio), não a existência de backend.

---

## Ordenação Canônica dos Módulos no POM Raiz

A lista `<modules>` do POM raiz **deve** seguir esta ordem fixa:

```xml
<modules>
    <!-- 1. Layouts (primeiro) -->
    <module>{artifactId}-layout</module>
    <module>{artifactId}-layout-{nome}</module>

    <!-- 2. Widgets -->
    <module>{artifactId}-widget</module>
    <module>{artifactId}-widget-{nome}</module>

    <!-- 3. Config -->
    <module>{artifactId}-config</module>

    <!-- 4. Entity -->
    <module>{artifactId}-entity</module>

    <!-- 5. Service -->
    <module>{artifactId}-service</module>

    <!-- 6. REST -->
    <module>{artifactId}-rest</module>

    <!-- 7. Wizard -->
    <module>{artifactId}-wizard</module>

    <!-- 8. Pack (SEMPRE último) -->
    <module>{artifactId}-pack</module>
</modules>
```

> **Regra:** o módulo **pack é sempre o último** na lista. Isso garante que o EAR
> seja montado somente após todos os módulos terem sido compilados. Ao adicionar
> módulos ao projeto, insira-os na posição correta conforme a ordem acima.

---

## Empacotamento EAR (Módulo Pack)

O módulo pack (`<packaging>ear</packaging>`) agrega todos os módulos via
`maven-ear-plugin`. As regras de declaração dependem do tipo de packaging do
módulo.

### Módulos WAR → `<webModule>`

Módulos com packaging `war` (config, widget, layout, rest, wizard) são declarados
como `<webModule>` na configuração do `maven-ear-plugin`, com `<contextRoot>`
explícito:

```xml
<modules>
    <webModule>
        <groupId>${project.groupId}</groupId>
        <artifactId>{artifactId}-widget</artifactId>
        <contextRoot>/{application.code}</contextRoot>
    </webModule>
    <!-- ... demais webModules -->
</modules>
```

### Módulos EJB e JAR → dependências `compile`

Módulos com packaging `ejb` (service) e `jar` (entity) **NÃO** são declarados
explicitamente como `<ejbModule>` ou `<jarModule>` na configuração do ear-plugin.
Em vez disso, são incluídos **apenas** como `<dependency>` do módulo pack com
scope `compile`:

```xml
<!-- No pom.xml do pack -->
<dependencies>
    <!-- Service (EJB) — empacotado automaticamente como ejbModule -->
    <dependency>
        <groupId>${project.groupId}</groupId>
        <artifactId>{artifactId}-service</artifactId>
        <type>ejb</type>
        <scope>compile</scope>
    </dependency>

    <!-- Entity (JAR) — empacotado automaticamente como biblioteca -->
    <dependency>
        <groupId>${project.groupId}</groupId>
        <artifactId>{artifactId}-entity</artifactId>
        <type>jar</type>
        <scope>compile</scope>
    </dependency>
</dependencies>
```

> **Anti-pattern:** declarar `<ejbModule>` ou `<jarModule>` explicitamente no
> ear-plugin para módulos service/entity. O Maven já detecta e empacota
> corretamente pelo `<type>` da dependência.

### Dependências WAR no Pack

Módulos WAR também são declarados como `<dependency>` do pack com scope `compile`
(além de aparecerem como `<webModule>` no ear-plugin):

```xml
<dependency>
    <groupId>${project.groupId}</groupId>
    <artifactId>{artifactId}-widget</artifactId>
    <type>war</type>
    <scope>compile</scope>
</dependency>
```

### `finalName`

Todos os módulos declaram em seu `<build>`:

```xml
<build>
    <finalName>${project.artifactId}</finalName>
</build>
```

Isso garante que o nome do artefato gerado (`.war`, `.jar`, `.ejb`, `.ear`) seja
o próprio `artifactId` — sem sufixo de versão — facilitando referências
consistentes no EAR e no servidor.

### Coerência entre as três listas de módulos (cruzamento obrigatório)

O empacotamento correto depende de **três listas** independentes descreverem o
mesmo conjunto de módulos. Elas DEVEM ser cruzadas entre si; qualquer módulo
presente numa e ausente noutra é incoerência de empacotamento:

| Lista | Onde vive | Papel |
|-------|-----------|-------|
| **A. Módulos do agregador** | `<modules>` do POM raiz | Módulos que o build compila |
| **B. Dependências do pack** | `<dependencies>` do POM do módulo pack | Artefatos que entram no EAR |
| **C. Módulos web do ear-plugin** | `<modules>`/`<webModule>` do `maven-ear-plugin` (no pack) | WARs declarados com `contextRoot` |

Regras de cruzamento:

- Todo módulo **WAR** que é dependência do pack (B) DEVE ter um `<webModule>`
  correspondente no ear-plugin (C) — WAR em B sem entrada em C **não recebe
  `contextRoot`** e não é publicado corretamente.
- `<modules></modules>` **vazio** no ear-plugin enquanto o pack tem dependências
  WAR em B é incoerência de empacotamento (nenhum `contextRoot` é atribuído).
- Todo módulo declarado no agregador (A) que deva ser distribuído DEVE **chegar ao
  pack** — como `<webModule>` (WAR) ou como `<dependency>` por `<type>` (EJB/JAR).
- Módulo declarado no agregador (A) sem diretório físico é configuração morta; WAR
  físico ausente do agregador é módulo não declarado.

> **Anti-pattern:** manter dezenas de WARs como dependência do pack (B) com o
> `<modules>` do ear-plugin (C) vazio — o EAR é montado sem os `contextRoot`
> esperados. Cruzar A ↔ B ↔ C antes de afirmar que o empacotamento está correto.

---

## POM Raiz — Elementos Estruturais

O POM raiz do projeto multi-módulo contém:

| Elemento | Papel |
|----------|-------|
| `<packaging>pom</packaging>` | Define como projeto agregador |
| `<version>${revision}</version>` | Versão gerenciada via propriedade (CI-friendly) |
| `<modules>` | Lista de módulos na ordem canônica |
| `<properties>` | `revision`, `fluig.version`, `java.version`, encoding |
| `<repositories>` | Nexus Fluig (`https://nexus.fluig.com/content/groups/public`) |
| `<dependencyManagement>` | Centraliza versões de todas as dependências (plataforma como `provided`) |
| `<build><plugins>` | Plugins efetivos (war, yuicompressor, closure-compiler, compiler) |
| `<build><pluginManagement>` | Configuração herdável de plugins |

### Herança de POM nos Módulos

Cada módulo herda do POM raiz via `<parent>`:

```xml
<parent>
    <groupId>{groupId}</groupId>
    <artifactId>{artifactId}</artifactId>
    <version>${revision}</version>
</parent>
```

Isso garante que propriedades, `dependencyManagement` e `pluginManagement` do POM
raiz se apliquem a todos os módulos sem repetição.

### Resumo Visual da Estrutura

```text
{artifactId}/                          ← POM raiz (packaging: pom)
├── pom.xml
├── .gitignore
├── .mvn/
│   └── maven.config                   ← -Drevision=1.0.0
├── {artifactId}-config/               ← WAR
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-widget/               ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-layout/               ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-entity/               ← JAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-service/              ← EJB (opcional)
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-rest/                 ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
├── {artifactId}-wizard/               ← WAR (opcional)
│   ├── pom.xml
│   └── src/main/...
└── {artifactId}-pack/                 ← EAR (SEMPRE último)
    └── pom.xml
```

---

## Nomenclatura Maven (coordenadas)

As coordenadas Maven do projeto seguem as convenções:

| Coordenada | Regra | Exemplo |
|------------|-------|---------|
| `artifactId` | `{nome}-{tipo}` em kebab-case. `{nome}` identifica a solução; `{tipo}` identifica o módulo | `minha-solucao-widget`, `crm-integration-rest` |
| `version` | Sempre `${revision}` — versão CI-friendly gerenciada no `.mvn/maven.config` | `${revision}` |

> **`groupId` da plataforma:** os prefixos `com.fluig` e `com.totvs` são da
> plataforma. O tratamento desse `groupId` como restrição de marca é uma regra de
> publicação na Store (ver o callout de Parceiro abaixo), não uma convenção
> genérica deste arquivo.

> **Parceiro (Store):** o tratamento de `com.fluig`/`com.totvs` como `groupId`
> reservado (restrição de marca) é regra de publicação na Store — ver
> [partner-store-conventions.md](partner-store-conventions.md).

> **Coordenadas Maven nunca inventadas:** `groupId`, `artifactId` e o `parent`
> devem ser **inspecionados no projeto** existente, nunca fabricados.

---

## Java Runtime e APIs Java Públicas

| Aspecto | Valor |
|---------|-------|
| Versão | **Java 11** |
| Servidor | JBoss/WildFly (container Java EE gerenciado pela plataforma) |
| Compilação | `maven-compiler-plugin` com `source` e `target` = `${java.version}` (11) |

O projeto declara o artefato umbrella `javax:javaee-api:8.0.1` (scope `provided`).
Esse artefato é apenas o guarda-chuva de dependência; na prática, os **descritores
dos módulos** declaram specs em níveis mais antigos, e é esse o nível que o Fluig
espera:

| Spec | Versão | Evidência típica |
|------|--------|------------------|
| **JPA** | 2.0 | `persistence.xml` → `persistence_2_0.xsd`, `version="2.0"` (módulo entity) |
| **EJB** | 3.1 | `ejb-jar.xml` → `ejb-jar_3_1.xsd`; `maven-ejb-plugin` com `ejbVersion 3.1` (módulo service) |
| **CDI** | 1.0 | `beans.xml` → `beans_1_0.xsd` (módulos WAR) |
| **Servlet** | 3.0 | `web.xml` → `web-app_3_0.xsd`, `version="3.0"` (módulos WAR) |
| **JAX-RS** | 2.x | `@Path`/`@GET`/`@POST`/`@Produces` (módulo rest) — versão de spec não declarada em descritor |
| **Bean Validation** | 1.x | `@NotNull`/`@Size` em entities/DTOs — versão de spec não declarada em descritor |

> **Regra:** essas specs chegam pelo artefato umbrella `javax:javaee-api:8.0.1`
> (`provided`). **NUNCA** empacote implementações (ex.: Hibernate standalone,
> Jersey, Weld) — o container já fornece.
>
> ⚠️ **Não confunda o umbrella com a versão da spec.** `javaee-api 8.0.1` é a
> coordenada Maven do guarda-chuva; os **níveis de spec** que o Fluig espera nos
> descritores são os da tabela (JPA 2.0, EJB 3.1, CDI 1.0, Servlet 3.0). Use
> exatamente esses schemas/versões nos descritores dos módulos.

---

## Fluig SDK

Artefatos do SDK proprietário da plataforma. Fornecem acesso a serviços internos
do Fluig (segurança, usuários, documentos, workflows). Todos com scope `provided`.

| Artefato | GroupId | Versão | Finalidade |
|----------|---------|--------|------------|
| `fluig-sdk-api` | `com.fluig` | `${fluig.version}` | Interfaces de serviço (SecurityService, UserService, DocumentService, etc.) |
| `fluig-sdk-common` | `com.fluig` | `${fluig.version}` | Classes compartilhadas, DTOs, exceções (`SDKException`) |
| `fluig-api-tools` | `com.fluig` | `1.1.3` | Utilitários de API (ex.: `EncodedMediaType`) |

### Classes-chave do SDK

| Classe | Pacote | Uso |
|--------|--------|-----|
| `SecurityService` | `com.fluig.sdk.service.SecurityService` | Obter `tenantId` via `getCurrentTenantId()`, dados do usuário logado |
| `SDKException` | `com.fluig.sdk.api.common.SDKException` | Exceção checked lançada por métodos do SDK |
| `FluigAPI` | `com.fluig.sdk.api.FluigAPI` | Ponto de entrada alternativo para serviços SDK |
| `UserService` | `com.fluig.sdk.service.UserService` | Consulta de usuários da plataforma |

> **Javadoc oficial:** `https://api.fluig.com/old/sdk/` — consultar **sempre**
> antes de assumir pacotes, métodos ou exceções. Se não estiver no Javadoc, não
> existe.

> **Parceiro (Store):** o artefato `fluig-sdk-keyring` (gestão segura de
> credenciais via `Keyring`) e seu uso em eventos de componente são da camada de
> Store — ver [partner-store-architecture.md](partner-store-architecture.md). O
> SDK e seus escopos Maven estão descritos neste mesmo arquivo.

---

## Foundation

Artefatos da camada foundation da TOTVS. Fornecem classes base para persistência
e cache. Todos com scope `provided`.

| Artefato | GroupId | Versão | Finalidade |
|----------|---------|--------|------------|
| `foundation-common` | `com.fluig` | `${fluig.version}` | `AbstractDAO<T>`, `ServiceLocator`, exceções de CRUD |
| `foundation-cache-module` | `com.fluig` | `${fluig.version}` | Módulo de cache da plataforma |

### Classes-chave da Foundation

| Classe | Pacote | Uso |
|--------|--------|-----|
| `AbstractDAO<T>` | `com.totvs.technology.foundation.common.AbstractDAO` | Classe base para DAOs — fornece `create(T)`, `edit(T)`, `remove(T)` e Logger SLF4J |
| `ServiceLocator` | `com.totvs.technology.foundation.common.ServiceLocator` | Lookup de EJBs via JNDI no módulo REST: `ServiceLocator.getInstance().getService(JNDI_NAME)` |
| `FDNCreateException` | `com.totvs.technology.foundation.common.exception` | Exceção checked de `AbstractDAO.create()` |
| `FDNUpdateException` | `com.totvs.technology.foundation.common.exception` | Exceção checked de `AbstractDAO.edit()` |
| `FDNRemoveException` | `com.totvs.technology.foundation.common.exception` | Exceção checked de `AbstractDAO.remove()` |

---

## Dependências Maven — Escopos Corretos

### Regra Fundamental

O Fluig (JBoss/WildFly) já entrega no classpath do servidor: JAX-RS
(serialização JSON via RESTEasy/Jackson), JPA (Hibernate), EJB, CDI, Servlet,
JSF, JAXB, Bean Validation, SLF4J, entre outros.

> **NUNCA** adicionar como `compile` algo que o container já fornece.
>
> **Princípio de manutenibilidade (preferir o nativo/embarcado).** A regra **não é
> uma lista de bibliotecas proibidas** — é um princípio que vale para **qualquer
> biblioteca de terceiro**: prefira **sempre** o que o Fluig já entrega e o
> **Java nativo**. Toda dependência externa ao Fluig entra **com cautela**, porque
> cria risco de **manutenção futura** — quando a plataforma atualizar o Java (ou
> uma API interna), uma lib de terceiro empacotada pode quebrar, conflitar no
> classloader, trazer CVEs transitivos ou inflar o EAR. Antes de adicionar uma
> dependência `compile`, pergunte: **o container já fornece isso? dá para resolver
> com Java nativo?** Se sim, não empacote a lib.
>
> **Regra:** usar EXCLUSIVAMENTE o que o `<dependencyManagement>` do POM raiz
> declara como `provided`. Se precisar de funcionalidade extra, verificar primeiro
> se o container já fornece e se o nativo resolve.

### Exceção justificada: signpost-core (OAuth)

Quando **não houver** equivalente nativo/embarcado para a necessidade, uma
dependência third-party `compile` pode ser justificável — desde que documentada e
versionada. O caso canônico é o `signpost-core` (assinatura OAuth 1.0 para
integração com APIs externas que exigem OAuth), tipicamente a **única**
third-party `compile` empacotada no EAR.

### `<dependencyManagement>` do POM Raiz

O bloco abaixo centraliza versões e escopos — módulos filhos herdam sem repetir
`<version>` nem `<scope>`:

```xml
<dependencyManagement>
    <dependencies>
        <!-- Java EE 8 (API umbrella) -->
        <dependency>
            <groupId>javax</groupId>
            <artifactId>javaee-api</artifactId>
            <version>8.0.1</version>
            <scope>provided</scope>
        </dependency>

        <!-- Fluig SDK -->
        <dependency>
            <groupId>com.fluig</groupId>
            <artifactId>fluig-sdk-api</artifactId>
            <version>${fluig.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.fluig</groupId>
            <artifactId>fluig-sdk-common</artifactId>
            <version>${fluig.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.fluig</groupId>
            <artifactId>fluig-api-tools</artifactId>
            <version>1.1.3</version>
            <scope>provided</scope>
        </dependency>

        <!-- Foundation -->
        <dependency>
            <groupId>com.fluig</groupId>
            <artifactId>foundation-common</artifactId>
            <version>${fluig.version}</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>com.fluig</groupId>
            <artifactId>foundation-cache-module</artifactId>
            <version>${fluig.version}</version>
            <scope>provided</scope>
        </dependency>

        <!-- OAuth (única dependência compile third-party) -->
        <dependency>
            <groupId>oauth.signpost</groupId>
            <artifactId>signpost-core</artifactId>
            <version>2.1.1</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

> **Nota:** os módulos internos do projeto são declarados no
> `<dependencyManagement>` com o `<type>` adequado (`jar`, `ejb`, `war`, `ear`) e
> descomentados conforme o projeto cresce — cada módulo criado adiciona a entrada
> correspondente.

### Verificação assistida de dependências (comandos Maven)

Além da análise estática dos POMs, dá para **auditar dinamicamente** as
dependências com comandos Maven padrão. São comandos de **orientação** (a revisão
os recomenda, sem executá-los):

| Comando | Para que serve | Ação sobre o resultado |
|---------|----------------|------------------------|
| `mvn dependency:analyze` | Detecta *used undeclared* (usadas mas não declaradas) e *unused declared* (declaradas e não usadas) | Declarar as *used undeclared*; avaliar remoção das *unused declared* |
| `mvn dependency:tree` | Mostra a árvore de dependências e versões transitivas | Identificar conflito de versão transitiva e resolver com `<exclusions>` |
| `mvn versions:display-dependency-updates` | Lista atualizações disponíveis de libs de terceiros | Avaliar atualização de libs de terceiros |

> **Falsos positivos na limpeza (`dependency:analyze`):** NÃO remover como "não
> utilizadas" as dependências de **módulos EAR**, as bibliotecas **Java EE
> (JPA/EJB/CDI)** nem **qualquer biblioteca usada só via anotação/injeção de
> dependência ou geração de código** — o Maven não detecta esse uso. A remoção
> cega dessas quebra o build ou o runtime.

> **Consulta ao Nexus:** para conferir se uma biblioteca já é fornecida pelo Fluig
> e qual a versão disponível, consultar o repositório `public` em
> `https://nexus.fluig.com`. Regra de escopo: se o `groupId` for `com.fluig`, a
> dependência DEVE ser `provided`.

---

## Plugins Maven

Declarados no `<build><plugins>` do POM raiz (nível efetivo — todos os módulos
herdam):

| Plugin | Versão | Configuração-chave |
|--------|--------|--------------------|
| `maven-war-plugin` | 3.3.1 | `failOnMissingWebXml=false`, `warSourceExcludes=**/*.js,**/*.css`, `archive/manifestEntries/Dependencies=com.fluig.common` |
| `yuicompressor-maven-plugin` | 1.5.1 | **CSS apenas** — `excludes=**/*.js`, `nosuffix=true`, `force=true` |
| `closure-compiler-maven-plugin` | 2.21.0 | **JS apenas** — `<skip>true</skip>` no POM raiz (módulos WAR com JS sobrescrevem para `false`), `SIMPLE_OPTIMIZATIONS`, `NO_TRANSPILE`, `phase=generate-resources` |
| `maven-compiler-plugin` | 3.2 | `source=${java.version}`, `target=${java.version}` (Java 11) |

### Separação de responsabilidades na minificação (CSS × JS)

O empacotamento usa **dois minificadores** com papéis distintos e complementares:

| Minificador | Processa | Configuração-chave |
|-------------|----------|--------------------|
| `yuicompressor-maven-plugin` | **Somente CSS** | `excludes=**/*.js` — o YUI não deve tocar em JavaScript |
| `closure-compiler-maven-plugin` | **Somente JavaScript** | Suporta ES6; padrão oficial para minificar JS |

Motivo da separação: o YUI Compressor **não processa ES6** em JavaScript, então
seu uso fica restrito à minificação de CSS (com `excludes=**/*.js`). Para
minificar JavaScript com suporte a ES6, o padrão oficial é o
`closure-compiler-maven-plugin`. O Closure, por sua vez, **não processa CSS** —
por isso ambos coexistem no build. Os níveis de otimização do Closure são
`SIMPLE_OPTIMIZATIONS` (padrão) ou `ADVANCED_OPTIMIZATIONS` (com ofuscação).

> **Alerta de build — POM pai sem JS quebra o Closure.** Se o
> `closure-compiler-maven-plugin` não encontrar arquivos `.js` no diretório fonte
> (situação comum em **POMs pai**, que não têm recursos a minificar), o build
> **quebra**. A convenção é declarar `<skip>true</skip>` no POM pai e sobrescrever
> com `<skip>false</skip>` **apenas** nos módulos filhos que efetivamente contêm
> JavaScript (widget, layout, rest com recursos estáticos, wizard).

A minificação de um `.js` pelo `closure-compiler-maven-plugin` conflita com o
mecanismo de i18n quando esse arquivo usa template strings — ver
[Internacionalização (i18n)](conventions.md#internacionalização-i18n--widgets-e-layouts).

### `<pluginManagement>` (configuração herdável)

| Plugin | Versão | Nota |
|--------|--------|------|
| `maven-compiler-plugin` | 3.2 | source/target Java 11 |
| `maven-war-plugin` | 3.3.1 | `failOnMissingWebXml=false` |
| `maven-ejb-plugin` | 3.1.0 | `ejbVersion=3.1` |
| `maven-ear-plugin` | 2.10 | Usado pelo módulo pack |
| `closure-compiler-maven-plugin` | 2.21.0 | Base para override nos módulos |
| `yuicompressor-maven-plugin` | 1.5.1 | Compressão CSS |

### Lógica do closure-compiler (skip/override)

O POM raiz declara `<skip>true</skip>` por padrão — módulos **sem JavaScript**
(entity, service) não precisam do closure-compiler. Módulos WAR que contêm
arquivos `.js` (widget, layout, rest com recursos estáticos, wizard)
**sobrescrevem** no próprio `pom.xml`:

```xml
<plugin>
    <groupId>com.github.blutorange</groupId>
    <artifactId>closure-compiler-maven-plugin</artifactId>
    <configuration>
        <skip>false</skip>
    </configuration>
</plugin>
```

---

## Repositório Nexus Fluig

| Aspecto | Valor |
|---------|-------|
| URL | `https://nexus.fluig.com/content/groups/public` |
| ID no POM | `nexus` |
| Nome | `fluig Nexus Repository` |
| Autenticação | **Obrigatória** (403/401 sem credenciais) |
| Credenciais | Solicitadas via Central de Atendimento: `https://centraldeatendimento.fluig.com/hc/pt-br` |
| Configuração | `~/.m2/settings.xml` com `<server><id>nexus</id>` — **NUNCA** no `pom.xml` |

Declaração no POM raiz:

```xml
<repositories>
    <repository>
        <id>nexus</id>
        <name>fluig Nexus Repository</name>
        <url>https://nexus.fluig.com/content/groups/public</url>
    </repository>
</repositories>
```

---

## Propriedades do POM Raiz

```xml
<properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <revision>1.0.0</revision>
    <fluig.version>2.0.0</fluig.version>
    <java.version>11</java.version>
</properties>
```

| Propriedade | Uso |
|-------------|-----|
| `revision` | Versão CI-friendly — definida em `.mvn/maven.config` (`-Drevision=1.0.0`) |
| `fluig.version` | Versão do SDK/Foundation referenciada no `dependencyManagement` |
| `java.version` | Source/target do `maven-compiler-plugin` |

---

## JNDI Pattern

Os EJBs do backend são acessados via lookup JNDI. O padrão geral é um nome JNDI
global, da forma:

```
java:global/fluig/{jndi-name}
```

Onde `{jndi-name}` é a constante `JNDI_NAME` declarada na interface `@Remote` do
serviço:

```java
@Remote
public interface SampleService {
    String JNDI_NAME = "java:global/fluig/SampleService";
    String JNDI_REMOTE_NAME = "java:global/fluig/SampleService!com.exemplo.minhasolucao.service.SampleService";

    // métodos de negócio...
}
```

| Constante | Uso | Onde |
|-----------|-----|------|
| `JNDI_NAME` | Lookup via `ServiceLocator` (módulo REST) | `ServiceLocator.getInstance().getService(SampleService.JNDI_NAME)` |
| `JNDI_REMOTE_NAME` | Injection `@EJB(lookup = ...)` (módulo service → service) | `@EJB(lookup = SecurityService.JNDI_REMOTE_NAME)` |

> **Regra:** a parte final do JNDI (`{jndi-name}`) é, por convenção, o nome simples
> da interface (ex.: `SampleService`). O `JNDI_REMOTE_NAME` inclui o
> fully-qualified name da interface após `!`.

> **O segmento do namespace JNDI não é fixo.** O caminho JNDI depende da
> configuração do projeto — o segmento concreto (ex.: um namespace próprio da
> solução) é inspecionado no código existente, não assumido. Em particular, um
> segmento como `java:global/fluig/store/...` aparece apenas em projetos
> específicos e **não** é uma regra genérica: inspecione o valor real da constante
> `JNDI_NAME` no projeto antes de assumir o namespace.

---

## ServiceLocator

O módulo **REST** usa `ServiceLocator` para obter referências a EJBs — **não**
`@EJB` injection (endpoints JAX-RS não são managed beans EJB neste modelo):

```java
import com.totvs.technology.foundation.common.ServiceLocator;
import javax.naming.NamingException;

@Path("/samples")
public class SampleResource {

    private SampleService getService() throws NamingException {
        return (SampleService) ServiceLocator
                .getInstance()
                .getService(SampleService.JNDI_NAME);
    }
}
```

| Aspecto | Detalhe |
|---------|---------|
| Classe | `com.totvs.technology.foundation.common.ServiceLocator` |
| Método | `getInstance().getService(String jndiName)` |
| Retorno | `Object` (requer cast para a interface do serviço) |
| Exceção | `javax.naming.NamingException` (checked) — tratar ou propagar |
| Escopo | Usado **apenas** no módulo REST |

> **Anti-patterns:**
> - `@EJB private SampleService service;` no endpoint REST — ERRADO (não funciona
>   em JAX-RS puro deste modelo)
> - `@Inject private SampleService service;` — ERRADO (CDI injection não resolve
>   EJBs por JNDI neste contexto)
> - Instanciar `new SampleServiceImpl()` — ERRADO (perde o container EJB)

---

## Log SLF4J com Prefixo

Toda mensagem de log no backend **deve** incluir um prefixo `@<NomeComponente>` no
início da mensagem. Isso permite filtrar logs da solução em ambientes
compartilhados (multi-tenant, multi-componente).

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

private static final Logger log = LoggerFactory.getLogger(SampleServiceImpl.class);

log.info("@MinhaSolucao - Criando registro para tenant {}", tenantId);
log.error("@MinhaSolucao - Erro ao buscar dados", e);
```

| Regra | Detalhe |
|-------|---------|
| Prefixo | `@<NomeComponente>` (PascalCase, nome lógico da solução) |
| Separador | ` - ` (espaço, hífen, espaço) após o prefixo |
| Logger no DAO | Herdado de `AbstractDAO` como campo `log` — já disponível |
| Logger no Service/REST | Declarar `private static final Logger log = LoggerFactory.getLogger(...)` |
| Placeholder | Usar `{}` do SLF4J para interpolação (nunca concatenação) |

> **Anti-pattern:** `log.info("Registro criado")` sem prefixo — impossível
> rastrear qual solução gerou o log no servidor.

---

## Segurança TOTVSTech (security-domain)

O `security-domain` **TOTVSTech** é declarado em módulos que recebem requisições
HTTP autenticadas. É uma configuração **estrutural** de segurança dos descritores
JBoss (XML), válida para qualquer backend Java do Fluig que exponha módulos web
ou serviço EJB — não é um marcador de persona.

### Onde declarar

| Módulo | Descritor | Declara security-domain? |
|--------|-----------|--------------------------|
| config | `jboss-web.xml` | ✅ sim |
| widget | `jboss-web.xml` | ✅ sim |
| rest | `jboss-web.xml` | ✅ sim |
| wizard | `jboss-web.xml` | ✅ sim |
| service | `jboss-ejb3.xml` | ✅ sim |
| **layout** | `jboss-web.xml` | ❌ **NÃO** |

> **Exceção crítica:** o módulo **layout NÃO declara** `<security-domain>` nem
> `<security-role>` no `jboss-web.xml`. Copiar o `jboss-web.xml` do widget para o
> layout é ERRO.

### Security Roles (4 mapeamentos)

```xml
<security-role>
    <role-name>user</role-name>
    <principal-name>totvstech</principal-name>
</security-role>
<security-role>
    <role-name>totvstech</role-name>
    <principal-name>totvstech</principal-name>
</security-role>
<security-role>
    <role-name>sysadmin</role-name>
    <principal-name>wcmadmin</principal-name>
</security-role>
<security-role>
    <role-name>admin</role-name>
    <principal-name>wcmadmin</principal-name>
</security-role>
```

### jboss-ejb3.xml (módulo service)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<jboss:ejb-jar xmlns:jboss="http://www.jboss.com/xml/ns/javaee"
               xmlns="http://java.sun.com/xml/ns/javaee"
               xmlns:s="urn:security:1.1"
               version="3.1" impl-version="2.0">
    <assembly-descriptor>
        <s:security>
            <ejb-name>*</ejb-name>
            <s:security-domain>TOTVSTech</s:security-domain>
            <s:run-as-principal>totvstech</s:run-as-principal>
        </s:security>
    </assembly-descriptor>
</jboss:ejb-jar>
```

---

## Multi-Empresa (SecurityService)

O Fluig é multi-tenant — dados de diferentes empresas coexistem no mesmo banco.
Todo acesso a dados **deve** filtrar por `tenantId`.

### Obtendo o tenantId

```java
import com.fluig.sdk.service.SecurityService;
import com.fluig.sdk.api.common.SDKException;

@Stateless
public class SampleServiceImpl implements SampleService {

    @EJB(lookup = SecurityService.JNDI_REMOTE_NAME)
    private SecurityService securityService;

    private Long getTenantId() throws SDKException {
        return securityService.getCurrentTenantId();
    }
}
```

| Aspecto | Detalhe |
|---------|---------|
| Injection | `@EJB(lookup = SecurityService.JNDI_REMOTE_NAME)` no service |
| Método | `getCurrentTenantId()` — retorna `Long` |
| Exceção | `SDKException` (checked) — declarar no `throws` |
| Dependência | `fluig-sdk-common` como `provided` para compilar `SDKException` |

### Regras obrigatórias de tenantId

| Operação | Regra |
|----------|-------|
| **CREATE** | Atribuir `entity.setTenantId(getTenantId())` antes de persistir |
| **READ** (query) | Incluir `AND e.tenantId = :tenantId` em **toda** `@NamedQuery` |
| **UPDATE** | Validar que o registro pertence ao tenant antes de editar |
| **DELETE** | Validar que o registro pertence ao tenant antes de remover |

> **Anti-pattern:** query sem filtro de tenantId — expõe dados de outras empresas
> (vazamento de dados multi-tenant). Isso é **violação de segurança grave**.

---

## PersistenceContext AppDS

O persistence-unit do backend usa o DataSource compartilhado da plataforma
(`jdbc/AppDS`):

### persistence.xml (módulo entity)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<persistence xmlns="http://java.sun.com/xml/ns/persistence"
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
             xsi:schemaLocation="http://java.sun.com/xml/ns/persistence
             http://java.sun.com/xml/ns/persistence/persistence_2_0.xsd"
             version="2.0">
    <persistence-unit name="AppDS" transaction-type="JTA">
        <jta-data-source>jdbc/AppDS</jta-data-source>
        <class>com.exemplo.minhasolucao.entity.SampleEntity</class>
        <properties>
            <property name="hibernate.hbm2ddl.auto" value="update"/>
        </properties>
    </persistence-unit>
</persistence>
```

### Injection no DAO

```java
@PersistenceContext(unitName = "AppDS")
private EntityManager entityManager;
```

| Aspecto | Valor |
|---------|-------|
| Nome do persistence-unit | `AppDS` |
| DataSource | `jdbc/AppDS` |
| Transaction type | `JTA` (gerenciado pelo container) |
| Injection | `@PersistenceContext(unitName = "AppDS")` |
| DDL strategy | `hibernate.hbm2ddl.auto = update` (cria/atualiza tabelas automaticamente) |

---

## Pacote Base Java

A estrutura de pacotes segue o padrão:

```
{groupId}.{nomeComponente}.{tipo}
```

Onde `{nomeComponente}` é o nome lógico da solução em **lowercase sem separadores**
(derivado do artifactId removendo hífens).

**Exemplo** (para `groupId = com.exemplo`, solução `minha-solucao`):

| Módulo | Pacote |
|--------|--------|
| entity | `com.exemplo.minhasolucao.entity` |
| service (interface) | `com.exemplo.minhasolucao.service` |
| service (impl) | `com.exemplo.minhasolucao.service` |
| service (DAO) | `com.exemplo.minhasolucao.service` |
| rest | `com.exemplo.minhasolucao.rest` |

> **Regra:** o pacote base é **sempre** `{groupId}.{nomeComponente}` — depois
> adiciona-se o sufixo de camada (`.entity`, `.service`, `.rest`). Não criar
> subpacotes adicionais sem necessidade (ex.: `.service.impl`, `.service.dao`).

---

## DAO Pattern

O DAO do backend é um **EJB `@Stateless`** que estende `AbstractDAO<T>` da
foundation:

```java
import com.totvs.technology.foundation.common.AbstractDAO;
import javax.ejb.Stateless;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

@Stateless
public class SampleDAO extends AbstractDAO<SampleEntity> {

    @PersistenceContext(unitName = "AppDS")
    private EntityManager entityManager;

    public SampleDAO() {
        super(SampleEntity.class);
    }

    @Override
    public EntityManager getEntityManager() {
        return entityManager;
    }

    @Override
    public void setEntityManager(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    // Métodos de consulta customizados (NamedQueries)...
    // NÃO redefinir create(), edit(), remove() — usar os herdados
}
```

| Regra | Detalhe |
|-------|---------|
| Anotação | `@Stateless` (EJB) |
| Herança | `extends AbstractDAO<T>` |
| Construtor | `super(Entity.class)` — obrigatório |
| EntityManager | `@PersistenceContext(unitName = "AppDS")` como campo `private` |
| Getters/Setters | `public getEntityManager()` e `public setEntityManager(EntityManager)` — obrigatórios |
| CRUD herdado | `create(T)`, `edit(T)`, `remove(T)` — **nunca redefinir** |
| Logger | Campo `log` herdado de `AbstractDAO` — disponível sem declarar |
| Exceções CRUD | `FDNCreateException`, `FDNUpdateException`, `FDNRemoveException` (checked) |

> **Anti-patterns:**
> - Redefinir `create()`/`edit()`/`remove()` no DAO — ERRADO
> - `getEntityManager()` com visibilidade `private` ou `protected` — ERRADO (deve
>   ser `public`)
> - Esquecer `super(Entity.class)` no construtor — ERRADO (NPE em runtime)

---

## Estratégia de Persistência (Formulário/Dataset vs Entity)

A decisão entre os dois modelos de persistência **não é uma preferência de
estilo**: é uma escolha com impacto direto em **compliance LGPD**, **isolamento
multi-tenant** e **custo de manutenção**.

| Estratégia | Status | Quando usar | Custo de compliance/manutenção |
|------------|--------|-------------|-------------------------------|
| **Formulário + Dataset** | **Padrão recomendado** | Cadastros, CRUD, parâmetros, qualquer dado que possa ser modelado em formulário — inclui dados pessoais | **Baixo** — LGPD, tenant e sincronia de instalação resolvidos nativamente |
| **Entity JPA** | **Exceção justificada** | Somente casos que o modelo de formulário comprovadamente não atende | **Alto** — o backend assume manualmente LGPD, filtro de tenant e suporte cross-database |

### Padrão recomendado: Formulário + Dataset

Formulário + Dataset resolve **nativamente**, sem código Java:

| Benefício nativo | Como é resolvido |
|------------------|------------------|
| **Isolamento de tenant** | A plataforma isola os registros do formulário por empresa automaticamente — sem `tenantId` manual em query |
| **Compliance LGPD automático** | A classificação de dados pessoais é declarada no próprio HTML do campo via atributo `data-protection` — a plataforma trata anonimização/expurgo pelas rotinas nativas do Painel de Controle, **sem código Java nem telas manuais de anonimização** |

> **Regra:** dado pessoal (nome, CPF, e-mail, telefone, etc.) modelado em
> Formulário + Dataset só precisa do atributo `data-protection` no campo HTML
> correspondente. A partir daí, a anonimização e o expurgo são **nativos**.

### Exceção justificada: Entity JPA

Entity JPA só se justifica quando o modelo de Formulário + Dataset
**comprovadamente não atende**:

1. Queries relacionais complexas (JOINs, subqueries, aggregations)
2. Alto volume transacional com necessidade de controle fino
3. Dados provenientes de APIs externas sem formulário nativo correspondente

Ao optar por Entity, o desenvolvedor assume **manualmente** três encargos que o
padrão resolvia de graça:

| Encargo assumido | O que passa a ser manual |
|------------------|---------------------------|
| **LGPD manual** | A Entity **não se integra** às rotinas nativas de LGPD. É preciso construir do zero as telas/endpoints de expurgo e as rotinas de anonimização dos dados pessoais, além da auditoria |
| **Filtro de tenant manual** | Garantir `AND e.tenantId = :tenantId` em **todas** as queries e `setTenantId(getTenantId())` em toda criação (ver "Multi-Empresa") — a plataforma não isola a tabela automaticamente |
| **Suporte cross-database** | Suportar e testar em **3 SGBDs (Oracle, SQL Server e PostgreSQL)** usando `GenerationType.TABLE` + `@TableGenerator` — nunca `IDENTITY`/`SEQUENCE`/`AUTO` |

> **Impacto explícito de compliance:** **usar Entity invalida o benefício da LGPD
> nativa do Fluig.** A partir do momento em que um dado pessoal é persistido em
> Entity JPA, a anonimização e o expurgo deixam de ser automáticos e passam a
> exigir **desenvolvimento manual**. Persistir dado pessoal em Entity sem esses
> mecanismos é risco de compliance.

---

## Respostas REST

Endpoints JAX-RS do módulo REST seguem padrões consistentes de resposta.

### Content-Type

```java
import com.fluig.sdk.api.tools.EncodedMediaType;

@GET
@Produces(EncodedMediaType.APPLICATION_JSON_UTF8)
public Response list() { ... }
```

> **NUNCA** usar `MediaType.APPLICATION_JSON` (sem charset) — pode gerar encoding
> incorreto para caracteres acentuados.

### Paginação

Parâmetros de paginação como **query params**:

```java
@GET
@Path("/items")
@Produces(EncodedMediaType.APPLICATION_JSON_UTF8)
public Response list(
        @QueryParam("limit") @DefaultValue("10") int limit,
        @QueryParam("offset") @DefaultValue("0") int offset) {
    // ...
    return Response.ok(result).build();
}
```

### Status HTTP

| Operação | Status | Cenário |
|----------|--------|---------|
| GET (sucesso) | `200 OK` | Retorno com dados |
| POST (criação) | `201 Created` | Recurso criado com sucesso |
| PUT/DELETE (sucesso sem corpo) | `204 No Content` | Operação concluída |
| Validação inválida | `400 Bad Request` | Dados de entrada incorretos |
| Recurso não encontrado | `404 Not Found` | ID inexistente |
| Erro interno | `500 Internal Server Error` | Exceção não prevista |

### Regras de resposta

| Regra | Detalhe |
|-------|---------|
| Wrap em Response | Sempre `Response.ok(result).build()`, `Response.status(201).entity(created).build()` |
| Sem stack trace | **NUNCA** expor `e.getMessage()` ou `e.getStackTrace()` ao cliente |
| Erro genérico | Retornar mensagem genérica ao cliente; logar detalhe no servidor |
| JSON UTF-8 | Usar `EncodedMediaType.APPLICATION_JSON_UTF8` em todos os endpoints |

```java
// tratamento correto de erro
try {
    var result = getService().findAll(limit, offset);
    return Response.ok(result).build();
} catch (NamingException e) {
    log.error("@MinhaSolucao - Falha no lookup do serviço", e);
    return Response.status(500).build();
}
```

---

## Context-root por tipo de módulo

Cada módulo WAR declara seu `context-root`. A regra depende do tipo de módulo:

| Módulo | Regra de context-root | Exemplo |
|--------|----------------------|---------|
| Widget | `/{application.code}` | `/samplewidget` |
| Layout | `/{application.code}` | `/samplelayout` |
| Config | `/{artifactId-config-sem-hifens}` | `/minhasolucaoconfig` |
| REST | `/{definido-pelo-desenvolvedor}` | `/minhasolucao-api` |
| Wizard | `/{application.code}` | `/minhasolucaowizard` |

> ⚠️ **Anti-pattern:** usar o artifactId do módulo Maven como context-root do
> widget/layout (ex.: `/minha-solucao-widget` — ERRADO). O correto é
> `/{application.code}`.

> **`simple.deploy`:** a semântica genérica do campo `simple.deploy` do
> `application.info` é documentada em [architecture.md](architecture.md). Não é
> uma regra específica deste arquivo.

---

## Codificação UTF-8 (Arquivos e APIs)

Todo código gerado ou evoluído DEVE manter codificação UTF-8 de ponta a ponta.

| Camada | Regra |
|--------|-------|
| Arquivos-fonte (JS/FTL/CSS/XML/`.properties`) | Salvar em UTF-8 — nunca ISO-8859-1/Windows-1252 |
| Respostas REST | `EncodedMediaType.APPLICATION_JSON_UTF8` (ver "Respostas REST") — nunca `MediaType.APPLICATION_JSON` sem charset |
| Locale `.properties` | Caracteres não-ASCII em `\uXXXX` |
| Chamadas a serviços externos | Definir charset UTF-8 em request/response |

> **Anti-pattern:** gerar `.properties` ou FTL em codificação diferente de UTF-8 —
> acentos corrompem na plataforma.

---

## Provisionamento via Eventos de Componente (`ActivationListener`)

O contrato `ActivationListener` permite que a plataforma invoque o backend em
eventos de ciclo de vida da solução (instalação, reativação, desabilitação). O
exemplo completo vive em
[`examples/activation/README.md`](../examples/activation/README.md).

### Contrato Java (conciso)

Uma classe EJB implementa
`com.fluig.sdk.api.component.activation.ActivationListener`, com `mappedName` e
`name` iguais e no formato `activator/<component_code>`:

```java
@Remote
@Stateless(mappedName = "activator/<component_code>", name = "activator/<component_code>")
public class Activate implements ActivationListener {
    public String getArtifactFileName();              // nome do artefato implantado (ex.: "minhasolucao-pack.ear")
    public void install(ActivationEvent event);        // primeira instalação OU toda reativação/atualização
    public void enable(ActivationEvent event);         // componente reabilitado
    public void disable(ActivationEvent event);        // componente desabilitado
}
```

> **VERIFICAR — `@Singleton` × `@Stateless`.** Há divergência observada no tipo de
> bean usado para a classe de ativação: alguns projetos a declaram como
> `@Stateless` e outros como `@Singleton`. Esta divergência fica **registrada como
> ponto a VERIFICAR**: inspecione o projeto e a documentação oficial antes de
> assumir um dos dois — não há, neste ponto, uma regra única confirmada.

### Padrão de provisionamento dentro de `install()`

1. **Idempotência (obrigatória).** Consultar se o formulário/dataset já existe
   (por nome/dataset-name, em todos os locales instalados) **antes** de criar
   qualquer coisa — `install()` é chamado de novo em toda reativação/atualização,
   então criar sem checar duplica o provisionamento a cada ciclo.
2. **Extração de recurso embarcado.** Se ausente, abrir o artefato implantado
   (WAR/EAR) como zip via a API de diretório de artefatos implantáveis da
   plataforma e ler os recursos empacotados.
3. **Upload e registro via API pública.** Enviar os arquivos extraídos pela API
   pública de arquivos de conteúdo e registrar via a API pública de
   card-index/form.
4. **Seed de dados.** Para cada arquivo de seed, criar um registro via a API
   pública de card-item/form-record.
5. **Safety check de admin de tenant.** `install()` roda no contexto de um
   **tenant**; recusar a execução quando o contexto for de administrador de
   **instância** (super-admin cross-tenant).

> **Parceiro (Store):** o vínculo da classe de ativação com o descritor
> `component.xml` (`<activationClass>`) e o uso de credenciais via Keyring em
> `enable()` são da camada de Store — ver
> [partner-store-architecture.md](partner-store-architecture.md).

---

## i18n em Camada REST/Java (`ResourceBundle`)

A camada backend Java (REST/service/entity) pode ser chamada por um cliente **sem
sessão Fluig** — por isso resolve o locale a partir do cabeçalho HTTP
`Accept-Language` da requisição, não da sessão do usuário. É **Java puro**
(`java.util.ResourceBundle` + `java.text.MessageFormat`), não passa pelo
FreeMarker.

### Quando se aplica

Use este mecanismo em classes Java de módulos `*-rest`/`*-service`/`*-entity` que
precisam devolver mensagens localizadas (ex.: erro de validação, erro inesperado)
para um chamador que pode não ter sessão Fluig. Nesse cenário não há locale de
sessão a consultar — o único sinal de idioma disponível é o `Accept-Language`
enviado pelo próprio cliente HTTP.

### Contrato

| Peça | Regra |
|------|-------|
| Bundle base | `messages.properties` — fallback/default, **sem** sufixo de locale |
| Bundles de locale | Um `messages_<locale>.properties` por locale suportado (ex.: `messages_pt_BR.properties`, `messages_en_US.properties`, `messages_es.properties`) — mesmo conjunto de chaves em todos |
| Resolução de locale | `Locale resolveLocale(HttpHeaders headers)`: retorna `headers.getAcceptableLanguages().get(0)` quando presente; caso contrário, um locale padrão fixo (ex.: `new Locale("pt", "BR")`) |
| Carga do bundle | `ResourceBundle.getBundle("messages", locale)` |
| Interpolação | `MessageFormat.format(bundle.getString(key), args)` — marcadores posicionais `{0}`, `{1}`, ... |
| Fallback | Em `MissingResourceException`, repetir a carga/formatação com o locale padrão fixo |
| Consumo típico | Dentro de um `catch` do endpoint JAX-RS, para montar o corpo de uma resposta de erro (ver "Respostas REST") |

```java
// Utilitário final, sem estado — ver examples/activation/MessageUtils.java
public final class MessageUtils {
    private static final String BUNDLE_NAME = "messages";
    private static final Locale DEFAULT_LOCALE = new Locale("pt", "BR");

    public static Locale resolveLocale(HttpHeaders headers) {
        if (headers != null) {
            List<Locale> acceptable = headers.getAcceptableLanguages();
            if (acceptable != null && !acceptable.isEmpty()) {
                return acceptable.get(0);
            }
        }
        return DEFAULT_LOCALE;
    }

    public static String getMessage(Locale locale, String key, Object... args) {
        Locale resolved = locale == null ? DEFAULT_LOCALE : locale;
        try {
            ResourceBundle bundle = ResourceBundle.getBundle(BUNDLE_NAME, resolved);
            return MessageFormat.format(bundle.getString(key), args);
        } catch (MissingResourceException e) {
            ResourceBundle fallback = ResourceBundle.getBundle(BUNDLE_NAME, DEFAULT_LOCALE);
            return MessageFormat.format(fallback.getString(key), args);
        }
    }
}
```

Na classe JAX-RS, injete o cabeçalho e consulte o utilitário dentro do tratamento
de erro (ver "Respostas REST" — nunca expor stacktrace ao cliente):

```java
@Path("/activate")
public class ActivateRest {

    @Context
    private HttpHeaders headers;

    // ...dentro de um catch:
    String localizedMessage = MessageUtils.getMessage(
            MessageUtils.resolveLocale(headers), "error.unexpected");
    return Response.status(500).entity(new ErrorStatus(localizedMessage)).build();
}
```

### Por que `Accept-Language`, não a sessão do usuário

Os demais domínios de i18n do Fluig resolvem o locale a partir do contexto de
sessão do usuário logado. Esta camada é diferente porque pode ser alcançada por um
chamador **sem sessão Fluig**: não há usuário logado de quem extrair um locale de
sessão, então o único sinal de idioma disponível é o cabeçalho HTTP
`Accept-Language` — e é dele que `resolveLocale` extrai o locale.

### Codificação dos bundles de locale

Os bundles de locale desta camada (`messages_pt_BR.properties`,
`messages_en_US.properties`, `messages_es.properties`) seguem a convenção do
pacote para `.properties` de locale: caracteres não-ASCII escapados em `\uXXXX`
([Codificação dos arquivos .properties](conventions.md#codificação-dos-arquivos-properties)),
com acentuação direta permitida apenas no bundle base (`messages.properties`).
Mantenha o `pom.xml` do módulo com
`<project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>`. Os arquivos
de exemplo em [`examples/activation/`](../examples/activation/README.md) aplicam
essa regra.

### Exemplo completo

Ver [`examples/activation/README.md`](../examples/activation/README.md) — arquivos
`MessageUtils.java`, `messages.properties`, `messages_pt_BR.properties`,
`messages_en_US.properties`, `messages_es.properties` e o uso em
`ActivateRest.java`.

---

## Checklist de Build e Empacotamento

Verificações **genéricas** de build e empacotamento do projeto Maven
multi-módulo, válidas para **qualquer persona** (estruturais, não ligadas à
publicação na Store). Cobrem a coerência entre o que está no disco, o que o POM
declara e o que entra no artefato final.

| Aspecto | Regra |
|---------|-------|
| Módulos web declarados | Todo módulo WAR existente no disco DEVE constar em `<modules>` do POM raiz. WAR não declarado fica fora do build; módulo declarado sem diretório físico é configuração morta (ver [Coerência entre as três listas de módulos (cruzamento obrigatório)](#coerência-entre-as-três-listas-de-módulos-cruzamento-obrigatório)). |
| Minificação | `yuicompressor-maven-plugin` (CSS) e `closure-compiler-maven-plugin` (JS) são o padrão de minificação; a ausência aumenta o tamanho do EAR e piora a performance. O padrão é `closure-compiler` com `skip=true` no POM raiz e `skip=false` nos módulos widget/layout (ver [Lógica do closure-compiler (skip/override)](#lógica-do-closure-compiler-skipoverride)). |
| Manifesto WAR | O `maven-war-plugin` deve declarar `Dependencies: com.fluig.common` no manifesto; sem isso os módulos Fluig podem não carregar. |
| `warSourceExcludes` | Excluir do WAR os arquivos originais não-minificados, para evitar duplicação (fonte + minificado). |
| Hierarquia de módulos | `rest` depende de `service`; o módulo pack (EAR) depende de rest/service; o SDK Fluig entra sempre como `provided` (ver [Regra Fundamental](#regra-fundamental) e [Herança de POM nos Módulos](#herança-de-pom-nos-módulos)). |
| Separação de responsabilidades | Cada módulo tem **uma** função (service, rest, entity, widget, layout, pack). Misturar responsabilidades num módulo pede refatoração. |
| Artefatos fora do empacotamento | Recursos (`datasets/`, `forms/`, `workflow/`) soltos na raiz, fora do empacotamento declarado, não chegam ao artefato final — confirmar se há rotina que os empacota/instala antes de tratar como erro. |
| `beans.xml` | Presente em `META-INF/`/`WEB-INF/` quando o módulo usa CDI. |
| Arquivos de desenvolvimento | `.project`, `.map`, `node_modules/`, `.git/` e afins não entram no entregável. |

**Classificação de vulnerabilidades por escopo de dependência** (ver
[Dependências Maven — Escopos Corretos](#dependências-maven--escopos-corretos)):

| Escopo | Responsabilidade | Leitura |
|--------|------------------|---------|
| `provided` (fluig-sdk, javaee-api) | Plataforma | Débito técnico da plataforma, não do projeto |
| `compile` (libs próprias) | Projeto | Deve ser mantida/atualizada pelo projeto |
