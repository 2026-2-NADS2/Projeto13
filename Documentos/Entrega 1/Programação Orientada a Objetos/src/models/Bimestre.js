const ErroNegocio = require('../errors/ErroNegocio');

class Bimestre {
  constructor({ id = null, numero, anoLetivo, abertura, encerramento }) {
    const n = Number(numero);
    if (![1, 2, 3, 4].includes(n)) throw new ErroNegocio('O bimestre deve ser 1, 2, 3 ou 4');
    if (!Number.isInteger(Number(anoLetivo))) throw new ErroNegocio('Ano letivo inválido');

    this.id = id;
    this.numero = n;
    this.anoLetivo = Number(anoLetivo);
    this.abertura = new Date(abertura);
    this.encerramento = new Date(encerramento);

    if (isNaN(this.abertura) || isNaN(this.encerramento)) {
      throw new ErroNegocio('Datas de abertura/encerramento inválidas');
    }
    if (this.encerramento <= this.abertura) {
      throw new ErroNegocio('O encerramento deve ser depois da abertura');
    }
  }

  // Regra: o professor só digita dentro do período definido pelo Administrador
  estaAberto(agora = new Date()) {
    return agora >= this.abertura && agora <= this.encerramento;
  }

  static fromRow(row) {
    return new Bimestre({
      id: row.id,
      numero: row.numero,
      anoLetivo: row.ano_letivo,
      abertura: row.data_abertura,
      encerramento: row.data_encerramento,
    });
  }
}

module.exports = Bimestre;
