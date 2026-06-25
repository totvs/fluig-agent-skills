// Exemplo mínimo de referência — Eventos de Form Fluig
// Demonstra: handlers de ciclo de vida (carga/validação) e de campo, em ES6+,
// com validação/sanitização da entrada do usuário.
// Textos visíveis em Português (Brasil) — i18n de widgets/layouts não se aplica a forms.
// Não é um projeto completo. Ver context/architecture.md e context/conventions.md.
//
// Os nomes dos handlers abaixo são representativos dos pontos de extensão
// públicos do formulário (ciclo de vida e campos). Confirme os nomes exatos
// dos eventos na documentação oficial do Fluig antes de usar em produção.

// Handler de ciclo de vida: executado ao carregar o formulário.
function onLoad(form) {
  // Ex.: preparar estado inicial / valores padrão dos campos.
  const today = new Date().toISOString().slice(0, 10);
  form.setValue('startDate', today);
}

// Handler de ciclo de vida: executado ao validar o formulário (antes de salvar).
function beforeSave(form) {
  // Entrada não confiável: sanitizar antes de validar/persistir.
  const rawName = form.getValue('requesterName') || '';
  const safeName = DOMPurify.sanitize(rawName, { USE_PROFILES: { html: false } });
  form.setValue('requesterName', safeName);

  if (!safeName.trim()) {
    // Mensagem de erro em português (padrão para formulários).
    throw new Error('O nome do solicitante é obrigatório.');
  }

  const days = Number(form.getValue('days'));
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error('Informe uma quantidade de dias válida.');
  }
}

// Evento de campo: reage à mudança em um campo específico.
function onChangeRequesterName(form) {
  const rawValue = form.getValue('requesterName') || '';
  // Converte HTML em texto puro (elimina XSS) antes de reutilizar o valor.
  const sanitized = WCMAPI.validateXSS(rawValue);
  form.setValue('requesterName', sanitized);
}
