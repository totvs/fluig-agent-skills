# Processo (BPM) — Eventos, Facilitadores e Atividade de Serviço

> Fonte única de verdade do pacote para o modelo conceitual dos **eventos de
> processo (BPM/workflow)** e da **Atividade de Serviço (servicetask)**: a
> separação de camadas entre Form, eventos de processo e integrações pesadas,
> os objetos facilitadores disponíveis no server-side e os padrões de
> comunicação, idempotência e tratamento de erro. As skills referenciam este
> arquivo em vez de duplicar seu conteúdo. Para a view/eventos do próprio
> Form (client-side), veja [architecture.md](architecture.md#form-formulário-eletrônico)
> e [conventions.md](conventions.md#convenções-de-form-formulário-eletrônico).
> Para a estrutura de pastas (`diagrams/`, `forms/events/`), veja
> [architecture.md](architecture.md#estrutura-de-um-projeto-fluig).

> **Sem fonte oficial verificável:** o conteúdo deste arquivo documenta
> comportamento conhecido da plataforma e boas práticas consolidadas de
> consultoria/comunidade Fluig, sem pageId de TDN ou link de api.fluig.com que
> o referencie diretamente. Trate-o como prosa de boas práticas documentadas
> pelo pacote, não como citação de fonte oficial.

## Visão Geral

Um processo de workflow do Fluig combina três camadas com responsabilidades
distintas. Confundir essas camadas é a causa mais comum de código de processo
difícil de manter: lógica de UI vazando para o servidor, integração pesada
bloqueando a thread do usuário, ou dado sensível circulando pelo HTML.

| Camada | Responsabilidade | Onde roda |
|--------|-------------------|-----------|
| Form | View e validação simples de preenchimento | Client-side (navegador do usuário) |
| Eventos de Processo | Roteamento leve, leitura/gravação de campos do card, decisões de fluxo | Server-side, na própria thread da requisição do usuário |
| Atividade de Serviço (servicetask) | Integrações pesadas/assíncronas com sistemas externos | Server-side, **fora** da thread da requisição do usuário, com reprocessamento nativo em caso de falha |

## Separação de Camadas

O **Form** cuida apenas da view e de validações simples (campo obrigatório,
formato) — client-side, igual a qualquer outro formulário eletrônico (ver
[conventions.md](conventions.md#convenções-de-form-formulário-eletrônico)).

Os **Eventos de Processo** são handlers server-side de roteamento leve,
executados ainda dentro da thread da requisição do usuário. Os mais comuns:

- `beforeTaskSave` — executa antes de a tarefa ser salva/movida para a próxima
  atividade; ponto comum para validações finais e gravação de campos do card.
- `validateForm` — valida o preenchimento do formulário no servidor antes de
  avançar o fluxo.
- `displayFields` — executa ao exibir o formulário da atividade; ponto usual
  para montar dados que o frontend vai consumir (ver seção de `customHTML`
  abaixo).
- `beforeStateEntry` — executa antes de entrar em um novo estado do processo.

A **Atividade de Serviço (servicetask)** é o lugar certo para integrações
pesadas ou potencialmente lentas (chamada a ERP, serviço externo, geração de
documento). Ela roda **fora** da thread da requisição do usuário — o usuário
não fica esperando a integração responder — e a plataforma tem
**reprocessamento nativo**: se a atividade falhar, o Fluig tenta executá-la de
novo automaticamente. Essa característica é o motivo pelo qual idempotência
(ver abaixo) é obrigatória nesse tipo de atividade.

## Objetos Facilitadores nos Eventos de Processo

Dentro dos eventos server-side do processo, três objetos facilitadores
cobrem a maior parte das necessidades:

| Objeto | Uso típico |
|--------|------------|
| `form` | `getValue(nome)`/`setValue(nome, valor)` para ler/gravar campos do formulário; `getFormMode()` para saber se é inclusão/edição/visualização; `getMobile()` para detectar contexto mobile |
| `customHTML` | `.append(html)` injeta HTML/JS construído no backend para o frontend renderizar — tipicamente usado dentro de `displayFields` |
| `hAPI` (contexto de processo) | `getCardValue(nome)`/`setCardValue(nome, valor)` para ler/gravar campos do card do processo; `getAdvancedProperty(nome)` para propriedades avançadas do processo. Disponível em eventos como `beforeTaskSave`/`afterProcessCreate` |

### Chaves globais `getValue("WKxxx")`

Além dos campos definidos pelo formulário, o método `getValue(...)` também
expõe chaves globais do processo, prefixadas com `WK`:

| Chave | Uso típico |
|-------|------------|
| `WKUser` | Login do usuário que está executando a tarefa atual |
| `WKNumState` | Número do estado (atividade) atual do processo |
| `WKNumProces` | Número da instância do processo (solicitação) — chave de rastreio para log e correlação de integrações |
| `WKCompany` | Código da empresa/tenant do processo |
| `WKComent` | Comentário registrado no movimento da tarefa |

## Padrão: Contexto Único via `customHTML.append()`

Quando o formulário client-side precisa de dados que já existem no contexto do
processo (campos do card, propriedades do usuário, número da instância), o
padrão recomendado é capturar esses valores no evento `displayFields` e
injetar **um único objeto de contexto** no HTML via `customHTML.append()`, em
vez de espalhar vários campos `hidden` pelo formulário:

```javascript
// displayFields (server-side)
var contexto = {
  numProcesso: getValue("WKNumProces"),
  usuario: getValue("WKUser"),
  statusAprovacao: hAPI.getCardValue("statusAprovacao")
};
customHTML.append(
  "<script>window.ProcessContext = " + JSON.stringify(contexto) + ";</script>"
);
```

O frontend consome `window.ProcessContext` diretamente, sem precisar varrer o
DOM em busca de múltiplos campos `hidden`.

### Anti-padrão: Dataset/AJAX para dado já disponível no processo

Buscar via `DatasetFactory`/AJAX, no client-side, um dado que já está
disponível via `getValue(...)` ou `hAPI` no contexto do processo é uma
requisição HTTP desnecessária — o mesmo tipo de round-trip evitável descrito
no [anti-padrão "Dataset chamando Dataset"](conventions.md#anti-padrão-dataset-chamando-dataset)
em `conventions.md`: cada salto adicional é latência e uma nova superfície de
falha. Prefira sempre o padrão de contexto único acima.

## Atividade de Serviço (servicetask): Idempotência e Erro

### Idempotência: GET de verificação antes do POST

Como a plataforma pode **reprocessar** uma Atividade de Serviço que falhou, o
script da integração deve ser escrito para suportar execução repetida sem
duplicar efeito colateral. O padrão recomendado é fazer um **GET de
verificação** antes do POST — checar se o registro já foi criado/a operação já
foi concluída do lado do sistema externo — e só então decidir se o POST
precisa ser enviado.

### Regra crítica — o `catch` DEVE relançar o erro

> 🚨 **O `catch` de uma Atividade de Serviço DEVE relançar o erro:** se o erro
> da integração for apenas logado (`console.error`/log) e **engolido** no
> `catch`, sem um `throw` relançando-o, a plataforma assume que a atividade
> terminou com sucesso e **avança o fluxo normalmente** — mascarando a falha
> de integração como se tudo tivesse funcionado. O `throw` é o único sinal que
> a plataforma reconhece para acionar o reprocessamento e o fluxo de erro do
> BPMN (ver "Modelagem de Fallback" abaixo).

```javascript
// ❌ catch que engole o erro — plataforma assume sucesso e segue o fluxo
try {
  invocarServicoExterno(payload);
} catch (e) {
  logger.error('Falha na integração: ' + e.message);
}

// ✅ catch que relança o erro — plataforma reconhece a falha
try {
  invocarServicoExterno(payload);
} catch (e) {
  logger.error('Falha na integração: ' + e.message);
  throw e;
}
```

## Modelagem de Fallback no BPMN

Para que a falha de uma Atividade de Serviço vire um fluxo de tratamento
visível (em vez de travar silenciosamente a solicitação), o padrão de
modelagem recomendado é conectar um **Evento Intermediário de Captura de
Erro** à Atividade de Serviço, desviando o fluxo para uma **Atividade de
Usuário** de tratamento, atribuída a um Papel ou Grupo responsável:

```text
[Atividade de Serviço: Integrar com ERP]
          |
          | (erro capturado)
          v
[Evento Intermediário de Captura de Erro]
          |
          v
[Atividade de Usuário: "Tratar Erro de Integração"] -- atribuída a Papel/Grupo
```

Isso só funciona se o `catch` do script relançar o erro, como descrito acima
— sem o `throw`, o Evento Intermediário de Captura de Erro nunca é acionado.

## Log Estruturado para Integrações

Para facilitar o diagnóstico de falhas de integração (inclusive as
reprocessadas automaticamente), o log de uma Atividade de Serviço deve
registrar, de forma estruturada, pelo menos:

- `getValue("WKNumProces")` — para correlacionar o log com a instância do
  processo;
- o endpoint chamado;
- o payload enviado;
- a resposta recebida (ou o erro, quando a chamada falhar).

## Segurança: Nunca Credencial em Campo Hidden do Formulário

Token, senha ou qualquer credencial de integração **nunca** deve ser
armazenado em campo `hidden` do formulário do processo — assim como qualquer
outro campo do HTML, ele é inspecionável via DOM pelo usuário no navegador.
Essa regra complementa, com um vetor específico, as regras já existentes em
[conventions.md — Regras de negócio e controle de acesso no client-side](conventions.md#regras-de-negócio-e-controle-de-acesso-no-client-side)
e em [conventions.md — Caso 3 (Terceiro que exige credencial)](conventions.md#caso-3--terceiro-que-exige-credencial-nunca-client-side);
o caminho correto para a credencial é sempre o Cadastro de Serviços, do lado
server-side.

## Referências Cruzadas

- Para a view/eventos do próprio Form (client-side) e a estrutura de pastas
  (`diagrams/`, `forms/events/`): [architecture.md](architecture.md).
- Para as "Três casos de integração HTTP" e o Caso 3 (credencial nunca
  client-side), o anti-padrão "Dataset chamando Dataset" e as regras de
  controle de acesso no client-side: [conventions.md](conventions.md).
- Para a convenção de i18n específica de processos (`i18n.translate`,
  pasta `diagrams/literals/`): [conventions.md — Internacionalização (i18n) —
  Processos (Workflow)](conventions.md#internacionalização-i18n--processos-workflow)
  — não duplicada aqui.
