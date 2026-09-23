const ErroNegocio = require('../errors/ErroNegocio');
const { Status, TRANSICOES } = require('./StatusAcompanhamento');

class Acompanhamento {
  static MEDIA_MINIMA = 0;
  static MEDIA_MAXIMA = 10;

  constructor({
    id = null, alunoId, turmaId, disciplinaId, professorId, bimestreId,
    descricao, media, status = Status.RASCUNHO, tagIds = [],
  }) {
    const obrigatorios = { alunoId, turmaId, disciplinaId, professorId, bimestreId };
    for (const [campo, valor] of Object.entries(obrigatorios)) {
      if (!valor) throw new ErroNegocio(`Campo obrigatório: ${campo}`);
    }
    if (!descricao || String(descricao).trim().length < 10) {
      throw new ErroNegocio('A descrição deve ter pelo menos 10 caracteres');
    }

    this.id = id;
    this.alunoId = Number(alunoId);
    this.turmaId = Number(turmaId);
    this.disciplinaId = Number(disciplinaId);
    this.professorId = Number(professorId);
    this.bimestreId = Number(bimestreId);
    this.descricao = String(descricao).trim();
    this.media = Acompanhamento.validarMedia(media);
    this.status = status;
    this.tagIds = [...new Set(tagIds.map(Number))]; // remove tags repetidas
  }

  // Regra: a média respeita a escala da escola e é validada pelo sistema
  static validarMedia(valor) {
    const n = Number(valor);
    if (valor === null || valor === undefined || valor === '' || Number.isNaN(n)) {
      throw new ErroNegocio('Média é obrigatória e deve ser numérica');
    }
    if (n < Acompanhamento.MEDIA_MINIMA || n > Acompanhamento.MEDIA_MAXIMA) {
      throw new ErroNegocio(`A média deve estar entre ${Acompanhamento.MEDIA_MINIMA} e ${Acompanhamento.MEDIA_MAXIMA}`);
    }
    return Math.round(n * 100) / 100;
  }

  podeTransitarPara(novoStatus) {
    return (TRANSICOES[this.status] || []).includes(novoStatus);
  }

  alterarStatus(novoStatus) {
    if (!this.podeTransitarPara(novoStatus)) {
      throw new ErroNegocio(`Transição inválida: ${this.status} → ${novoStatus}`, 422);
    }
    this.status = novoStatus;
  }

  static fromRow(row) {
    return new Acompanhamento({
      id: row.id,
      alunoId: row.aluno_id,
      turmaId: row.turma_id,
      disciplinaId: row.disciplina_id,
      professorId: row.professor_id,
      bimestreId: row.bimestre_id,
      descricao: row.descricao,
      media: row.media,
      status: row.status,
    });
  }
}

module.exports = Acompanhamento;
