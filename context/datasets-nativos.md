# Datasets Nativos do Fluig

> **Papel deste arquivo:** catálogo de referência dos datasets nativos mais
> utilizados da plataforma Fluig. Serve como fonte de consulta para agentes de IA
> e desenvolvedores que precisam conhecer os nomes, colunas disponíveis e filtros
> suportados ao consumir datasets nativos via `DatasetFactory.getDataset()` ou
> API REST v2. Para convenções de consumo no front-end (URL, paginação, regras de
> performance), veja [conventions.md](conventions.md) — seção "Consumo de Datasets
> no Front-End". Para o padrão de chamada dentro de `SuperWidget.extend`, veja
> [conventions.md](conventions.md) — [Consumo de dataset por widget (padrão SuperWidget)](conventions.md#consumo-de-dataset-em-widget-padrão-superwidget).

---

## Como Consumir Datasets Nativos

### Server-side (scripts de dataset, eventos, customizações Java)

Utilizar `DatasetFactory.getDataset()`:

```javascript
var dataset = DatasetFactory.getDataset(
    'colleague',                    // nome do dataset nativo
    ['colleagueId', 'login'],       // fields: colunas desejadas (null = todas)
    constraints,                    // constraints: filtros (null = sem filtro)
    sortFields                      // sortFields: ordenação (null = sem ordenação)
);
```

**Regras:**
- Sempre informar `fields` com apenas as colunas necessárias (evitar `null` em produção)
- Montar constraints com `DatasetFactory.createConstraint()` antes de passar ao método
- Em datasets customizados server-side, o callback é síncrono (retorno direto)

### Client-side (widgets, wizards, front-end)

Utilizar a **API REST v2** (preferencial) ou `DatasetFactory` encapsulado em Promise.

**URL canônica:**

```
/dataset/api/v2/dataset-handle/search
```

**Exemplo com fetch:**

```javascript
// ✅ regra 2 da constituição: fetch com async/await e try/catch
// (método dentro de SuperWidget.extend({}); o chamador trata o erro)
loadColleagues: async function() {
    var url = WCMAPI.getServerURL()
        + '/dataset/api/v2/dataset-handle/search'
        + '?datasetId=colleague'
        + '&field=colleagueId&field=login&field=colleagueName'
        + '&limit=50&offset=0';

    try {
        var response = await fetch(url, {
            headers: { 'Accept': 'application/json; charset=UTF-8' }
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        var data = await response.json();
        return data.values || []; // data.values contém os registros
    } catch (error) {
        FLUIGC.toast({ message: "${i18n.getTranslation('dataset.loadError')}", type: 'danger' });
        return [];
    }
}
```

**Parâmetros da API REST v2:**

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `datasetId` | ✅ | Nome do dataset (ex.: `colleague`, `document`) |
| `field` | Recomendado | Colunas desejadas (repetir para cada coluna) |
| `limit` | Recomendado | Quantidade máxima de registros |
| `offset` | Opcional | Deslocamento para paginação |

> ⚠️ **Em código novo, prefira a API v2** `/dataset/api/v2/dataset-handle/search`
> (paginação nativa, sem `vcXMLRPC.js`). A URL `/api/public/ecm/dataset/search` é
> a **API pública anterior** (v1) — **existe e é pública** (não é "interna"; está
> documentada), mas evite-a em código novo. Já o prefixo **sem `/public/`** — ex.:
> `/ecm/api/rest/ecm/dataset/...` — **esse sim** é rota interna não documentada e
> **não deve** ser consumido direto. Padrão completo dentro de `SuperWidget.extend`
> em [Consumo de dataset por widget (padrão SuperWidget)](conventions.md#consumo-de-dataset-em-widget-padrão-superwidget).

---

## Performance: filtrar pela Chave Primária (PK) e pela empresa (`companyId`)

> ⚠️ **Regra de performance (sempre que possível).** Ao consultar um dataset
> interno/nativo, **envie constraints pelos campos da Chave Primária (PK)** — e,
> quando a PK inclui `companyId` (a **empresa/tenant**), **filtre também por ela**.
> A PK é indexada; filtrar por ela (em vez de por um campo descritivo qualquer, ou
> trazer tudo e filtrar em memória) reduz drasticamente o volume lido e o tempo de
> resposta. Confirmar os campos da PK no catálogo abaixo antes de montar a
> constraint.

**A maioria dos datasets nativos tem PK composta cujo primeiro componente é
`companyId`** (fonte oficial: TDN *Datasets internos*, pageId 161350218).
Exemplos confirmados:

| Dataset | Campos da PK (ordem) |
|---------|----------------------|
| `colleague` | `colleaguePK.companyId` + `colleaguePK.colleagueId` |
| `group` | `groupPK.companyId` + `groupPK.groupId` |
| `colleagueGroup` | `colleagueGroupPK.companyId` + `colleagueGroupPK.colleagueId` + `colleagueGroupPK.groupId` |
| `document` | `documentPK.companyId` + `documentPK.documentId` + `documentPK.version` |
| `workflowRole` | `workflowRolePK.companyId` + `workflowRolePK.roleId` |
| `workflowColleagueRole` | `workflowColleagueRolePK.companyId` + `colleagueId` + `roleId` |
| `processDefinition` | `processDefinitionPK.companyId` + ... |

> O valor de `companyId` é o código da empresa/tenant da sessão. Em contexto
> **server-side** (dataset/evento), obtenha-o do contexto da solicitação
> (ex.: `getValue("WKCompany")` em eventos de processo) — **não** fixe um número.
> Em contexto de **customização Java/Parceiro**, use
> `SecurityService.getCurrentTenantId()` (ver `backend-java-maven.md`).

```javascript
// ✅ server-side: filtra pela PK (companyId + colleagueId) — indexado, rápido
var constraints = [
    DatasetFactory.createConstraint('colleaguePK.companyId', empresa, empresa, ConstraintType.MUST),
    DatasetFactory.createConstraint('colleaguePK.colleagueId', codUsuario, codUsuario, ConstraintType.MUST)
];
var ds = DatasetFactory.getDataset('colleague', ['colleagueId', 'colleagueName'], constraints, null);
```

> **Dica para quem cria um Dataset avançado:** ao modelar um dataset avançado
> (customizado), **projete a leitura das constraints para honrar a PK e o
> `companyId`/tenant** — leia esses filtros do parâmetro `constraints` e
> aplique-os **na origem** (na query/serviço externo), não depois em memória.
> Assim o seu dataset fica tão eficiente quanto os nativos e os consumidores
> conseguem filtrar por empresa e por chave. Lembre que **dataset avançado não
> aplica constraints sozinho** — quem implementa o filtro é o código do dataset
> (ver `conventions.md` › "Convenções de Dataset" e
> `fluig-scaffolding-dataset`).

---

## Catálogo de Datasets Nativos

### 1. colleague

**Descrição:** Retorna dados dos usuários (colaboradores) cadastrados no Fluig.

| Coluna | Descrição |
|--------|-----------|
| `colleagueId` | ID numérico do usuário |
| `colleaguePK` | Chave primária composta |
| `login` | Login do usuário no sistema |
| `colleagueName` | Nome completo do usuário |
| `mail` | E-mail principal |
| `active` | Status ativo (`true`/`false`) |
| `adminUser` | Indica se é administrador (`true`/`false`) |
| `telephoneNumber` | Telefone |
| `groupId` | ID do grupo principal |
| `spepiality` | Especialidade / área de atuação |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `login` | Filtrar por login exato ou parcial |
| `colleagueName` | Filtrar por nome do usuário |
| `active` | Filtrar por status ativo/inativo |
| `mail` | Filtrar por e-mail |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST);
var dataset = DatasetFactory.getDataset('colleague', ['login', 'colleagueName', 'mail'], [c1], null);
```

---

### 2. document

**Descrição:** Retorna metadados de documentos armazenados no ECM (GED) do Fluig.

| Coluna | Descrição |
|--------|-----------|
| `documentPK` | Chave primária composta do documento |
| `documentId` | ID numérico do documento |
| `version` | Número da versão |
| `documentDescription` | Nome/título do documento |
| `parentDocumentId` | ID da pasta pai |
| `documentType` | Tipo do documento (pasta, arquivo, formulário, etc.) |
| `publisherId` | Login do publicador |
| `createDate` | Data de criação |
| `lastModifiedDate` | Data da última modificação |
| `expirationDate` | Data de expiração |
| `fileSize` | Tamanho do arquivo em bytes |
| `phisicalFile` | Nome do arquivo físico |
| `accessCount` | Quantidade de acessos |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `documentId` | Filtrar por ID do documento |
| `parentDocumentId` | Filtrar por pasta pai (listar conteúdo de pasta) |
| `documentType` | Filtrar por tipo de documento |
| `publisherId` | Filtrar por publicador |

**Tipos de documento comuns (`documentType`):**

| Valor | Tipo |
|-------|------|
| `0` | Pasta raiz da empresa |
| `1` | Pasta |
| `2` | Documento/Arquivo |
| `3` | Documento externo |
| `4` | Formulário |
| `5` | Registro de formulário |
| `7` | Anexo de workflow |
| `8` | Artigo |
| `9` | Relatório |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('parentDocumentId', '100', '100', ConstraintType.MUST);
var c2 = DatasetFactory.createConstraint('documentType', '2', '2', ConstraintType.MUST);
var dataset = DatasetFactory.getDataset('document', ['documentId', 'documentDescription', 'publisherId'], [c1, c2], null);
```

---

### 3. group

**Descrição:** Retorna os grupos de usuários cadastrados na plataforma.

| Coluna | Descrição |
|--------|-----------|
| `groupPK` | Chave primária composta |
| `groupId` | Código identificador do grupo |
| `groupDescription` | Descrição/nome do grupo |
| `active` | Status ativo (`true`/`false`) |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `groupId` | Filtrar por código do grupo |
| `groupDescription` | Filtrar por descrição |
| `active` | Filtrar por status ativo/inativo |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST);
var dataset = DatasetFactory.getDataset('group', ['groupId', 'groupDescription'], [c1], null);
```

---

### 4. role

**Descrição:** Retorna os papéis (roles) cadastrados no sistema de controle de acesso.

| Coluna | Descrição |
|--------|-----------|
| `rolePK` | Chave primária composta |
| `roleId` | Código identificador do papel |
| `roleDescription` | Descrição/nome do papel |
| `active` | Status ativo (`true`/`false`) |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `roleId` | Filtrar por código do papel |
| `roleDescription` | Filtrar por descrição |
| `active` | Filtrar por status ativo/inativo |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('active', 'true', 'true', ConstraintType.MUST);
var dataset = DatasetFactory.getDataset('role', ['roleId', 'roleDescription'], [c1], null);
```

---

### 5. post

**Descrição:** Retorna posts do feed social / comunidades do Fluig.

| Coluna | Descrição |
|--------|-----------|
| `postPK` | Chave primária composta |
| `postId` | ID numérico do post |
| `content` | Conteúdo textual do post |
| `authorId` | Login do autor |
| `authorName` | Nome do autor |
| `createdDate` | Data de criação |
| `communityId` | ID da comunidade (se aplicável) |
| `parentPostId` | ID do post pai (para respostas/comentários) |
| `likeCount` | Quantidade de curtidas |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `authorId` | Filtrar por login do autor |
| `communityId` | Filtrar por comunidade específica |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('communityId', '50', '50', ConstraintType.MUST);
var dataset = DatasetFactory.getDataset('post', ['postId', 'content', 'authorName', 'createdDate'], [c1], null);
```

---

### 6. workflowProcess

**Descrição:** Retorna informações sobre processos (definições) de workflow cadastrados no Fluig.

| Coluna | Descrição |
|--------|-----------|
| `workflowProcessPK` | Chave primária composta |
| `processId` | Código do processo |
| `processInstanceId` | ID da instância do processo (solicitação) |
| `processDescription` | Descrição/nome do processo |
| `requesterId` | Login do solicitante |
| `state` | Estado da solicitação (aberta, finalizada, cancelada) |
| `startDate` | Data de início |
| `endDate` | Data de finalização |
| `currentActivityId` | ID da atividade atual |
| `currentAssignee` | Responsável atual |

**Constraints suportados (filtros aplicáveis):**

| Campo | Descrição do filtro |
|-------|---------------------|
| `processId` | Filtrar por código do processo |
| `requesterId` | Filtrar por solicitante |
| `state` | Filtrar por estado da solicitação |

**Exemplo de uso:**

```javascript
var c1 = DatasetFactory.createConstraint('processId', 'meu_processo', 'meu_processo', ConstraintType.MUST);
var c2 = DatasetFactory.createConstraint('state', '0', '0', ConstraintType.MUST); // 0 = aberta
var dataset = DatasetFactory.getDataset('workflowProcess', ['processInstanceId', 'processDescription', 'requesterId', 'state'], [c1, c2], null);
```

---

## Notas Importantes

### Constraints — como montar

```javascript
// Sintaxe: DatasetFactory.createConstraint(field, initialValue, finalValue, constraintType)
var constraint = DatasetFactory.createConstraint('campo', 'valorInicial', 'valorFinal', ConstraintType.MUST);
```

| ConstraintType | Comportamento |
|----------------|---------------|
| `MUST` | O campo **deve** ter o valor especificado (AND) |
| `SHOULD` | O campo **pode** ter o valor especificado (OR) |
| `MUST_NOT` | O campo **não deve** ter o valor especificado (exclusão) |

### Boas práticas

- **Sempre filtrar colunas** (`fields`) — nunca retornar todas as colunas se não forem necessárias
- **Sempre aplicar constraints** quando possível — evitar carregar todo o dataset em memória
- **Paginar no front-end** — usar `limit` e `offset` na API REST v2
- **Não assumir colunas extras** — datasets nativos podem variar entre versões da plataforma; consulte apenas colunas documentadas
- **Preferir API REST v2 no client-side** — melhor performance, paginação nativa, sem necessidade de importar `vcXMLRPC.js`

### Referências

- Consumo via API REST v2 no front-end: [conventions.md](conventions.md) — seção "Consumo de Datasets no Front-End"
- Padrão de chamada em SuperWidget: [conventions.md](conventions.md) — [Consumo de dataset por widget (padrão SuperWidget)](conventions.md#consumo-de-dataset-em-widget-padrão-superwidget)
- Exemplo de dataset customizado com filtros: `examples/dataset/dataset-com-filtros/`
