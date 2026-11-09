// ============================================================
// utilitarios/formatar.js
// Funções puras (sem React) que deixam os dados "com cara de
// escola": datas no formato brasileiro, média com vírgula, nomes
// dos status em português.
// ============================================================

// "2026-09-18T18:00:00.000Z" -> "18/09/2026"
export function formatarData(dataISO) {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return '-';
  return data.toLocaleDateString('pt-BR');
}

// "2026-09-18T18:00:00.000Z" -> "18/09/2026 15:00"
export function formatarDataHora(dataISO) {
  if (!dataISO) return '-';
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return '-';
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

// Datas dos bimestres chegam como texto local "2026-12-10T23:59"
// (formato do datetime-local). -> "10/12/2026 às 23:59"
export function formatarPrazo(texto) {
  if (!texto) return '-';
  const [data, hora] = texto.split('T');
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano} às ${hora}`;
}

// 8.5 -> "8,5"   9 -> "9,0"
export function formatarMedia(media) {
  if (typeof media !== 'number' || Number.isNaN(media)) return '-';
  return media.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// 3 -> "3º bimestre"
export function nomeBimestre(numero) {
  return `${numero}º bimestre`;
}

// Valores do ENUM do banco -> texto para as pessoas.
export const NOMES_STATUS = {
  rascunho: 'Rascunho',
  enviado_revisao: 'Enviado para revisão',
  em_revisao: 'Em revisão',
  publicado: 'Publicado',
  devolvido: 'Devolvido para ajustes',
  cancelado: 'Cancelado',
};

// "12 relatórios encontrados" / "1 relatório encontrado"
export function contar(total, singular, plural) {
  return total === 1 ? `1 ${singular}` : `${total} ${plural}`;
}

// Texto da faixa azul a partir da lista de bimestres do ano.
export function textoDoPeriodo(bimestres) {
  const aberto = bimestres.find((b) => b.aberto);
  if (aberto) {
    return `${nomeBimestre(aberto.numero)} aberto para digitação até ${formatarPrazo(aberto.encerramento)}.`;
  }
  // Nenhum aberto: mostra o próximo a abrir (o texto "2026-11-20T00:00"
  // pode ser comparado como texto, porque vai do ano para o minuto).
  const agora = new Date();
  const agoraTexto = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const proximo = bimestres.find((b) => b.abertura > agoraTexto);
  if (proximo) {
    return `Nenhum bimestre aberto agora. O ${nomeBimestre(proximo.numero)} abre em ${formatarPrazo(proximo.abertura)}.`;
  }
  return 'Nenhum período de digitação aberto. Procure a coordenação.';
}
