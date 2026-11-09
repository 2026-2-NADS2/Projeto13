// ============================================================
// utilitarios/validacao.js
// Regras de validação usadas nos formulários ANTES de chamar a API
// (requisito "formulário com validação antes do envio").
// As MESMAS regras existem no servidor (server/utilitarios), porque
// o front pode ser burlado; aqui elas servem para dar retorno
// rápido e claro ao usuário.
// ============================================================

export const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Média digitada no <input type="number">: chega como TEXTO.
// Devolve a mensagem de erro, ou null se estiver tudo certo.
export function erroDaMedia(texto) {
  if (texto === '' || texto === null || texto === undefined) return 'Informe a média do bimestre.';
  const media = Number(String(texto).replace(',', '.'));
  if (Number.isNaN(media) || media < 0 || media > 10) return 'A média deve estar entre 0 e 10.';
  if (Math.abs(media * 10 - Math.round(media * 10)) > 1e-9) return 'Use no máximo uma casa decimal (ex.: 8,5).';
  return null;
}

// Converte o texto da média em número (aceita vírgula).
export function lerMedia(texto) {
  return Number(String(texto).replace(',', '.'));
}

// Regras de senha por perfil (iguais às do servidor e às telas).
export const REGRAS_SENHA = {
  administrador: {
    texto: 'Mínimo de 12 caracteres, com letras, números e pelo menos um símbolo.',
    valida: (s) => s.length >= 12 && /[A-Za-z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s),
  },
  padrao: {
    texto: 'Mínimo de 8 caracteres, com pelo menos uma letra e um número.',
    valida: (s) => s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s),
  },
};

export function regrasDoPerfil(perfil) {
  return perfil === 'administrador' ? REGRAS_SENHA.administrador : REGRAS_SENHA.padrao;
}
