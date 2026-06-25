// Exemplo mínimo de referência — Eventos de Form Fluig
// Demonstra: handlers de ciclo de vida (carga/validação) e de campo, em ES6+,
// com i18n.translate("chave") para mensagens visíveis e sanitização da entrada.
//
// ATENÇÃO — i18n de formulários:
//   ✅ Use: i18n.translate("chave")
//   ❌ Não use: ${i18n.getTranslation('chave')} (esse é o padrão de widgets/layouts)
//
// Ver context/conventions.md (seção "i18n — Formulários") e context/architecture.md.
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

  // Mensagens de validação via i18n.translate — nunca strings literais.
  if (!safeName.trim()) {
    throw i18n.translate("validation.required.field");
  }

  const days = Number(form.getValue('days'));
  if (!Number.isInteger(days) || days <= 0) {
    throw i18n.translate("validation.invalid.days");
  }
}

// Evento de campo: reage à mudança em um campo específico.
function onChangeRequesterName(form) {
  const rawValue = form.getValue('requesterName') || '';
  // Converte HTML em texto puro (elimina XSS) antes de reutilizar o valor.
  const sanitized = WCMAPI.validateXSS(rawValue);
  form.setValue('requesterName', sanitized);
}
