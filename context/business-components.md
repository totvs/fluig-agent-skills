# Componentes de Negócio Nativos do Fluig

> **Fonte única de verdade** para os **Componentes de Negócio** (business
> components) client-side oficiais da plataforma TOTVS Fluig. São facilitadores
> JavaScript, documentados na TDN, que encapsulam funcionalidades de negócio
> recorrentes (buscar documento, selecionar usuários, recortar imagem, etc.) e
> DEVEM ser reutilizados em vez de reimplementados do zero.
>
> **Delta sobre a base.** Este arquivo cobre exclusivamente os **componentes de
> negócio** (namespaces `ECMBC`, `SOCIALBC`, `WCMBC`, `LMSBC`). Para componentes
> de **interface** (Modal, Toast, DataTable, richeditor) veja
> [style-guide.md](style-guide.md) (`FLUIGC.*`). Para **APIs públicas** de
> plataforma (WCMAPI, DatasetFactory) veja [technologies.md](technologies.md) e
> [conventions.md](conventions.md). A regra transversal que **obriga o reuso**
> destes componentes está em [partner-store-review-rules.md](partner-store-review-rules.md)
> [§ 30](partner-store-review-rules.md#30-reuso-de-componentes-de-negócio-nativos).

---

## O que é um Componente de Negócio

Conforme a página oficial *Componentes de Negócio* (TDN, pageId 160104507), a
plataforma distingue:

- **Componentes de interface** — agnósticos, documentados no Guia de Estilos
  (Modal, Alertas, Toast, DataGrid). Namespace `FLUIGC`.
- **Componentes de negócio** — facilitadores para promover o **reuso** de uma
  funcionalidade de negócio (ex.: Selecionar Usuários, Selecionar Grupos, Buscar
  Documento).

Todos os componentes de negócio compartilham o mesmo contrato de uso:

1. Declarar a **dependência** no `application.info` do widget:
   `application.resource.component.N=<caminho-do-componente>` (N sequencial, sem
   repetir o índice — ver [architecture.md](architecture.md) e
   [§ 6](partner-store-review-rules.md#6-componentxml)).
2. Invocar o método **dentro de um `SuperWidget.extend`** (nunca em escopo
   global — ver [conventions.md](conventions.md) § SuperWidget), tipicamente a
   partir de um binding de evento.
3. A maioria segue a assinatura `NAMESPACE.metodo(config, callback)`, onde
   `callback(error, data)` trata erro e sucesso. Os seletores/seleção retornam
   um **array** em `data`.

> **Somente APIs públicas.** Todos os componentes abaixo foram confirmados na
> documentação oficial (TDN). Não invente parâmetros, métodos ou caminhos de
> dependência: se não constar aqui nem na TDN, não use.

---

## Tabela-resumo (seleção rápida)

| Componente de Negócio | Método | Dependência (`application.info`) |
|-----------------------|--------|----------------------------------|
| Atualizar arquivo físico | `ECMBC.updateDocument(config, cb)` | `ecm/updatedocument` |
| Busca de documentos | `ECMBC.searchDocument(config, cb)` | `ecm/searchdocument` |
| Busca de documento em comunidade | `ECMBC.sharingDocument(config, cb)` | `ecm/sharingDocument` |
| Renomear documentos e pastas | `ECMBC.renameDocument(config, cb)` | `ecm/renamedocument` |
| Recorte de imagem | `WCMBC.cropImage(config, cb)` | `wcm/cropimage` |
| Compartilhar | `SOCIALBC.share(target, config)` | `social/socialshare` |
| Listar compartilhamentos | `SOCIALBC.shareListModal(config, cb)` | `social/socialsharelist` |
| Visualização de artigos | `SOCIALBC.viewArticle(config, cb)` | `social/socialarticleview` |
| Resposta de formulário | `SOCIALBC.openAnswerForm(formId)` | `social/socialformanswer` |
| Seleção de usuários | `WCMBC.selectUser(options, ok, cancel)` | `wcm/selectuser` |
| Seleção de grupos | `WCMBC.selectGroup(options, ok, cancel)` | `wcm/selectgroup` |
| Seleção de papéis | `WCMBC.selectRole(options, ok, cancel)` | `wcm/selectrole` |
| Seleção de sub grupos | `WCMBC.selectUser(options, ok, cancel)` (com `group`) | `wcm/selectgroup` |
| Seleção de comunidades | `SOCIALBC.selectCommunity(config, cb)` | `social/selectcommunity` |
| Segurança de itens de aprendizado (LMS) | `LMSBC.elearningsecurity(options, ...errCb)` | `lms/elearningsecurity` |

---

## ECM — Documentos

### Atualizar arquivo físico

Encapsula a atualização do arquivo físico de um documento existente (abre o modal
de upload/versão).

- **Assinatura:** `ECMBC.updateDocument(config, callback)`
- **`config`:**
  - `id` (obrigatório) — id do documento a atualizar.
  - `version` (obrigatório) — versão **atual** do documento.
  - `types` (opcional) — extensões permitidas, separadas por `|` (ex.:
    `'gif|jpg|jpeg|tiff|png'`).
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=ecm/updatedocument`

```javascript
var MinhaWidget = SuperWidget.extend({
    bindings: { local: { 'update-document': ['click_updateDocument'] } },
    init: function () {
        this.id = 10;
        this.version = 1000;
        this.types = 'gif|jpg|jpeg|tiff|png';
    },
    updateDocument: function (el, ev) {
        ECMBC.updateDocument(
            { id: this.id, version: this.version, types: this.types },
            (err, data) => {
                if (err) { return FLUIGC.toast({ message: err.responseText, type: 'danger' }); }
                this.aoAtualizar(data);
            }
        );
    }
});
```

### Busca de documentos

Abre o modal de busca/seleção de documentos e pastas do ECM. **Já confirmado como
componente PÚBLICO** — `ECMBC.searchDocument` NÃO é API interna.

- **Assinatura:** `ECMBC.searchDocument(config, callback)`
- **`config`** (todos opcionais):
  - `form` — `true` renderiza a versão antiga, compatível com uso dentro de
    formulários; `false` (padrão) para widgets.
  - `title` — título do modal (padrão `'Selecionar registro'`).
  - `parentId` — id do diretório inicial (padrão `0`), com breadcrumb completo.
  - `docTypeId` — tipos que aparecem na busca, separados por `-` (padrão
    `'1-2-8'`).
  - `showPrivate` — mostrar arquivos privados.
  - `minPermission` — id da permissão mínima para exibir o arquivo.
  - `showCheckOutDocs` — mostrar arquivos em checkout.
  - `socialDocId` — id da pasta inicial (breadcrumb só desta pasta em diante).
  - `selectableDocTypeId` — tipos selecionáveis, separados por `-` (padrão
    `'1-2-8'`).
- **Tipos de documento (`docTypeId` / `selectableDocTypeId`):**
  `1` Pasta · `2` Documento normal · `3` Documento externo · `4` Formulário ·
  `5` Registro de formulário · `7` Anexo Workflow · `8` Novo conteúdo ·
  `9` Aplicativo · `10` Relatório.
- **`callback(error, data)`** — `data` contém o objeto do arquivo/pasta
  selecionado.
- **Dependência:** `application.resource.component.N=ecm/searchdocument`

```javascript
ECMBC.searchDocument(
    { docTypeId: '1-2', title: 'Selecione um documento' },
    (err, data) => {
        if (err) { return FLUIGC.toast({ message: err.responseText, type: 'danger' }); }
        // data = documento/pasta selecionado
    }
);
```

### Busca de documento em comunidade

Facilita a **busca e inserção de documentos em uma comunidade** do Fluig
plataforma. Abre o modal de seleção de documento no contexto de uma comunidade.

- **Assinatura:** `ECMBC.sharingDocument(config, callback)`
- **`config`** (todos opcionais — mas `alias` deve identificar a comunidade):
  - `alias` — link/alias da comunidade.
  - `title` — título do modal (padrão `'Selecionar documento'`).
  - `button` — texto do botão (padrão `'Inserir'`).
- **`callback(error, data)`** — `data` contém o objeto do arquivo/pasta
  selecionado.
- **Dependência:** `application.resource.component.N=ecm/sharingDocument`

```javascript
ECMBC.sharingDocument(
    { alias: 'minha-comunidade', title: 'Selecionar documento para a comunidade' },
    (err, data) => {
        if (err) { return FLUIGC.toast({ message: err.responseText, type: 'danger' }); }
        // data = documento/pasta selecionado
    }
);
```

### Renomear documentos e pastas

Abre o modal de renomear um documento/pasta existente.

- **Assinatura:** `ECMBC.renameDocument(config, callback)`
- **`config`:**
  - `id` (obrigatório) — id do documento a renomear.
  - `version` (obrigatório) — versão **atual** do documento.
  - `title` (opcional) — título customizado do modal.
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=ecm/renamedocument`

```javascript
ECMBC.renameDocument(
    { id: 10, version: 1000, title: 'Renomear documento' },
    (err, data) => {
        if (err) { return FLUIGC.toast({ message: err.responseText, type: 'danger' }); }
    }
);
```

---

## WCM — Interface / Seleção

### Recorte de imagem

Encapsula a atualização/recorte de imagens (foto de usuário ou comunidade).

- **Assinatura:** `WCMBC.cropImage(config, callback)`
- **`config`** (todos opcionais):
  - `alias` — alias do usuário/comunidade a atualizar (padrão: usuário logado).
  - `title` — título do modal (padrão `Editar foto`).
  - `types` — extensões permitidas, separadas por `|` (padrão `jpg|jpeg|png`).
  - `imageShape` — formato conforme o Guia de Estilos: `'rounded'`, `'circle'`
    ou `''`.
  - `imageSrc` — URL da imagem atual.
  - `saveCallback(data)` — chamado ao salvar; `data` são as coordenadas do
    recorte.
  - `cancelCallback()` — chamado ao cancelar.
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=wcm/cropimage`

```javascript
WCMBC.cropImage(
    { alias: this.alias, types: 'gif|jpg|jpeg|png', imageShape: 'circle' },
    (err, data) => {
        if (err) { return FLUIGC.toast({ message: err.responseText, type: 'danger' }); }
    }
);
```

### Seleção de usuários

Modal de seleção de um ou mais usuários. Retorna array em `data` (cada item tem
`login`, `description`, etc.).

- **Assinatura:** `WCMBC.selectUser(options, callbackSucesso, callbackCancelar)`
- **`options`:**
  - `multiselect` — `true` permite selecionar vários; `false` apenas um.
  - `required` — `true` só avança com seleção; `false` permite avançar vazio.
  - `onlyActiveUsers` — `true` lista apenas usuários ativos; `false` (padrão)
    lista todos.
- **Dependência:** `application.resource.component.N=wcm/selectuser`

```javascript
WCMBC.selectUser(
    { multiselect: true, required: true, onlyActiveUsers: true },
    (data) => { /* data = array de usuários selecionados */ },
    () => { /* usuário cancelou */ }
);
```

### Seleção de grupos

Modal de seleção de um ou mais grupos.

- **Assinatura:** `WCMBC.selectGroup(options, callbackSucesso, callbackCancelar)`
- **`options`:** `multiselect`, `required` (mesma semântica de *Seleção de
  usuários*).
- **Dependência:** `application.resource.component.N=wcm/selectgroup`

### Seleção de papéis

Modal de seleção de um ou mais papéis.

- **Assinatura:** `WCMBC.selectRole(options, callbackSucesso, callbackCancelar)`
- **`options`:** `multiselect`, `required`.
- **Dependência:** `application.resource.component.N=wcm/selectrole`

### Seleção de sub grupos

Modal de seleção de sub grupos de um grupo pai. Conforme a documentação oficial,
utiliza `WCMBC.selectUser` recebendo o parâmetro adicional `group`.

- **Assinatura:** `WCMBC.selectUser(options, callbackSucesso, callbackCancelar)`
- **`options`:**
  - `group` — código do grupo pai dos sub grupos a selecionar.
  - `multiselect`, `required`.
- **Dependência:** `application.resource.component.N=wcm/selectgroup`

```javascript
WCMBC.selectUser(
    { group: 'Administradores', multiselect: true, required: true },
    (data) => { /* sub grupos selecionados */ },
    () => { /* cancelado */ }
);
```

---

## SOCIAL — Social / Comunidades / Artigos

### Compartilhar

Encapsula o compartilhamento de conteúdo social (publicação, artigo, documento).

- **Assinatura:** `SOCIALBC.share(target, config)`
- **`target`** — seletor jQuery (string `'#seletor'`) ou objeto `$('#seletor')`.
- **`config`:** `showOnlyLink` (bool), `sourceType` (ex.: `'SOCIABLE'`), `type`
  (ex.: `'POST'`), `preview` (miniatura HTML), `link` (URL do recurso),
  `paramId` (id social).
- **Dependência:** `application.resource.component.N=social/socialshare`

```javascript
SOCIALBC.share('#botao-compartilhar', {
    showOnlyLink: false,
    sourceType: 'SOCIABLE',
    type: 'POST',
    preview: '<div>Miniatura</div>',
    link: 'http://servidor/portal/p/1/post/usuario/12',
    paramId: 12
});
```

> **Compartilhar / inserir documentos em comunidade.** Para **inserir documentos
> numa comunidade**, use o componente ECM *Busca de documento em comunidade*
> (`ECMBC.sharingDocument`), documentado na seção **ECM — Documentos**. Para
> **compartilhar conteúdo social** (publicação, artigo), use o componente
> **Compartilhar** (`SOCIALBC.share`) acima.

### Listar compartilhamentos

Abre um modal listando os compartilhamentos de um conteúdo social.

- **Assinatura:** `SOCIALBC.shareListModal(config, callback)`
- **`config`:**
  - `sociableId` (obrigatório) — id do objeto social cuja listagem será exibida.
  - `title` (opcional) — título do modal (ex.: `'Compartilhado por'`).
  - `instanceId` (opcional) — id da instância (ex.: `Date.now()`).
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=social/socialsharelist`

### Visualização de artigos

Abre o modal de visualização de um artigo social.

- **Assinatura:** `SOCIALBC.viewArticle(config, callback)`
- **`config`** (todos opcionais):
  - `articleId` — id do artigo.
  - `alias` — user code de quem está visualizando.
  - `version` — versão do artigo.
  - `title` — título customizado do modal.
  - `instanceId` — id customizado do componente (ex.: `Date.now()`).
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=social/socialarticleview`

### Seleção de comunidades

Modal de seleção de uma ou mais comunidades.

- **Assinatura:** `SOCIALBC.selectCommunity(config, callback)`
- **`config`** (ambos opcionais):
  - `multiselect` — permite selecionar várias comunidades (padrão `true`).
  - `required` — torna a seleção obrigatória no fluxo (padrão `false`).
- **`callback(error, data)`** — trata erro/sucesso.
- **Dependência:** `application.resource.component.N=social/selectcommunity`

### Resposta de formulário

Abre o formulário de resposta em qualquer parte da plataforma, sem perder a
navegação atual.

- **Assinatura:** `SOCIALBC.openAnswerForm(formId)`
- **`formId`** — string com o id do formulário no ECM (ex.: `'45'`).
- **Dependência:** `application.resource.component.N=social/socialformanswer`

```javascript
SOCIALBC.openAnswerForm('45');
```

---

## LMS — Aprendizado

### Segurança de itens de aprendizado

Padroniza a UI de configuração de segurança (permissões/restrições) de itens do
catálogo de aprendizado. Diferente dos demais, **retorna uma instância** com
métodos de leitura.

- **Assinatura:** `LMSBC.elearningsecurity(options, cbErroPermissions, cbErroRestrictions, cbErroParty, cbErroPartyModal)`
- **`options`:**
  - `containerId` (obrigatório) — id do elemento HTML que recebe o contêiner do
    componente.
  - `itemType` (obrigatório) — tipo do item do catálogo. Valores:
    - `'CatalogItem'` — catálogo de treinamentos e trilhas (pasta, treinamento,
      trilha, link).
    - `'DisciplineItem'` — catálogo de disciplinas e turmas (pasta, disciplina,
      link).
    - `'DisciplineClass'` — turma e turma modelo.
    - `'AssessmentCatalogItem'` — tópicos e questões.
  - `itemId` (opcional) — id do item do catálogo para carregar as definições de
    segurança existentes.
  - `showRadioButtons` (opcional, padrão `true`) — exibe os radio buttons de
    configuração de herança.
- **Métodos da instância retornada:**
  - `getSelectRadio()` — valor do radio selecionado (tipo de herança de
    segurança).
  - `getPermissions()` — todas as permissões do item.
  - `getRestrictions()` — todas as restrições do item.
- **Dependência:** `application.resource.component.N=lms/elearningsecurity`

```javascript
const options = { containerId: '#elearning-security', itemType: 'CatalogItem' };
this.elearningSecurity = LMSBC.elearningsecurity(options, (err) => {
    FLUIGC.toast({ message: 'Erro ao carregar dados de permissão', type: 'danger' });
});
// ...
const permissoes = this.elearningSecurity.getPermissions();
```

> **Descontinuação (LMS).** A partir da atualização **1.6.5-190219**, o LMS não
> faz mais parte da plataforma para **novas instalações**. Só permanece
> disponível para clientes que adquiriram a plataforma com o LMS incluso. Ao
> gerar/modernizar código, use este componente **apenas** quando o ambiente-alvo
> comprovadamente possui o LMS; caso contrário, não reutilize.

---

## Referências oficiais (TDN)

| Componente | pageId / origem |
|------------|-----------------|
| Componentes de Negócio (conceito) | 160104507 |
| Atualizar arquivo físico | 160104509 |
| Busca de documentos | 505770336 |
| Renomear documentos e pastas | 161352228 |
| Recorte de imagem | 161352230 |
| Compartilhar | 185751355 |
| Listar compartilhamentos | 185751362 |
| Visualização de artigos | 736177685 |
| Resposta de formulário | 185758540 |
| Seleção de usuários | 185739389 |
| Seleção de grupos | 185739566 |
| Seleção de papéis | 185739563 |
| Seleção de sub grupos | 185739570 |
| Seleção de comunidades | 189309230 |
| Segurança de itens de aprendizado | 272407097 |
