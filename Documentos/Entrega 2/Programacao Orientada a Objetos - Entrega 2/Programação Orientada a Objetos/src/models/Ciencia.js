const ErroNegocio = require('../errors/ErroNegocio');

// Ciência/retorno do responsável (RF12): confirma que leu o relatório publicado
class Ciencia {
  static TAMANHO_MAXIMO = 500;

  constructor({ id = null, acompanhamentoId, responsavelId, observacao = null }) {
    if (!acompanhamentoId || !responsavelId) {
      throw new ErroNegocio('Ciência precisa do acompanhamento e do responsável');
    }
    const texto = observacao ? String(observacao).trim() : null;
    if (texto && texto.length > Ciencia.TAMANHO_MAXIMO) {
      throw new ErroNegocio(`A observação pode ter no máximo ${Ciencia.TAMANHO_MAXIMO} caracteres`);
    }
    this.id = id;
    this.acompanhamentoId = Number(acompanhamentoId);
    this.responsavelId = Number(responsavelId);
    this.observacao = texto || null;
  }
}

module.exports = Ciencia;
