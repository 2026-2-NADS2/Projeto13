// Estados do fluxo editorial — os valores são iguais aos do ENUM do banco
const Status = Object.freeze({
  RASCUNHO: 'rascunho',
  ENVIADO: 'enviado_revisao',
  EM_REVISAO: 'em_revisao',
  PUBLICADO: 'publicado',
  DEVOLVIDO: 'devolvido',
  CANCELADO: 'cancelado',
});

// Máquina de estados: de onde se pode ir para onde
const TRANSICOES = Object.freeze({
  [Status.RASCUNHO]: [Status.ENVIADO, Status.CANCELADO],
  [Status.ENVIADO]: [Status.EM_REVISAO, Status.CANCELADO],
  [Status.EM_REVISAO]: [Status.PUBLICADO, Status.DEVOLVIDO, Status.CANCELADO],
  [Status.DEVOLVIDO]: [Status.ENVIADO, Status.CANCELADO],
  [Status.PUBLICADO]: [],
  [Status.CANCELADO]: [],
});

module.exports = { Status, TRANSICOES };
