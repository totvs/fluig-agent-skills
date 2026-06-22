// Exemplo mínimo de referência — Comunicação por eventos entre artefatos
// Demonstra: um Web Component dispara CustomEvent (payload em detail, bubbles:true)
// em resposta a uma ação; outro artefato escuta via addEventListener lendo ev.detail.
// Nomes de evento em kebab-case. Em ES6+.
// Não é um projeto completo. Ver context/conventions.md (seção "Comunicação entre
// artefatos (eventos)") e context/architecture.md.

// Web Component que dispara um evento ao concluir uma ação.
// Fora da classe, apenas import é permitido (sem function/const/let/var no topo).
export class DocumentListComponent extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    // Texto visível ao usuário sempre via i18n.
    const label = "${i18n.getTranslation('button.select')}";
    this.innerHTML = `<button type="button" data-select>${label}</button>`;

    const button = this.querySelector('[data-select]');
    button.addEventListener('click', () => this.onSelectDocument());
  }

  onSelectDocument() {
    // ✅ dispara: nome em kebab-case, payload em detail, bubbles para subir no DOM
    // (o pai escuta sem manter referência direta a este componente).
    this.dispatchEvent(new CustomEvent('document-selected', {
      detail: { id: 99, title: 'Contract 2024' },
      bubbles: true,
    }));
  }
}

customElements.define('document-list', DocumentListComponent);

// Em outro artefato (ex.: um componente-pai), escuta via addEventListener e lê
// o payload de ev.detail. O nome do evento segue em kebab-case.
// (Trecho ilustrativo do lado ouvinte, isolado em IIFE para não declarar nada no
// escopo de módulo — coerente com a regra "fora da classe, apenas import".)
(() => {
  const container = document.querySelector('document-list');
  container.addEventListener('document-selected', (ev) => {
    const { id, title } = ev.detail;
    // ✅ outro evento kebab-case, reagindo à seleção (ex.: tarefa concluída).
    container.dispatchEvent(new CustomEvent('task-completed', {
      detail: { documentId: id, documentTitle: title },
      bubbles: true,
    }));
  });
})();

// NOTA — caso SuperWidget: widgets não usam CustomEvent; comunicam-se por
// WCMAPI. Para disparar: WCMAPI.fireEvent(eventName, data). Para escutar:
// WCMAPI.addListener(context, eventName, callback, listenerId), onde context é
// o widget (this), callback recebe (evt, data) e listenerId é um identificador
// único que evita listeners duplicados. Os nomes de evento seguem em kebab-case.
//
//   WCMAPI.fireEvent('document-selected', { id: 99, title: 'Contract 2024' });
//
//   WCMAPI.addListener(this, 'document-selected', (evt, data) => {
//     // usa data.title
//   }, 'document-viewer');
