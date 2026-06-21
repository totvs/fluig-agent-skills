// Exemplo mínimo de referência — Evento de Processo BPM Fluig (server-side)
// Demonstra: handlers em pontos do ciclo de vida do processo (entrada de etapa,
// conclusão de tarefa) que injetam regra de negócio via API pública hAPI, em ES6+.
// Não é um projeto completo. Ver context/architecture.md e context/technologies.md.
//
// Os nomes dos handlers abaixo são representativos dos pontos de extensão
// públicos do ciclo de vida do processo. Confirme os nomes exatos dos eventos
// na documentação oficial do Fluig antes de usar em produção.

// Handler de ciclo de vida: executado antes de entrar em uma etapa do processo.
function beforeStateEntry(sequenceId) {
  // Regra de negócio: validar dados do processo antes de avançar de etapa.
  const amount = Number(hAPI.getCardValue('amount'));
  if (!Number.isFinite(amount) || amount <= 0) {
    // Interrompe a transição quando o valor informado é inválido.
    throw new Error("${i18n.getTranslation('process.error.invalidAmount')}");
  }
}

// Handler de ciclo de vida: executado após entrar em uma etapa do processo.
function afterStateEntry(sequenceId) {
  // Regra de negócio: registrar a etapa atual em um campo do formulário.
  hAPI.setCardValue('currentStep', String(sequenceId));
}

// Handler de ciclo de vida: executado após a conclusão de uma tarefa.
function afterTaskComplete(colleagueId, nextSequenceId, userList) {
  // Regra de negócio: marcar quem concluiu a tarefa e a próxima etapa do fluxo.
  hAPI.setCardValue('lastApprover', colleagueId);
  hAPI.setCardValue('nextStep', String(nextSequenceId));
}
