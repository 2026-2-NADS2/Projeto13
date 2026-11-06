const ErroNegocio = require('../errors/ErroNegocio');

class Aluno {
  constructor({ id = null, nome, dataNascimento, turmaId = null, ativo = true }) {
    if (!nome || !String(nome).trim()) throw new ErroNegocio('Nome do aluno é obrigatório');
    if (!dataNascimento) throw new ErroNegocio('Data de nascimento é obrigatória');

    const nascimento = new Date(dataNascimento);
    if (isNaN(nascimento)) throw new ErroNegocio('Data de nascimento inválida (use AAAA-MM-DD)');
    if (nascimento > new Date()) throw new ErroNegocio('Data de nascimento não pode ser no futuro');

    this.id = id;
    this.nome = String(nome).trim();
    this.dataNascimento = nascimento.toISOString().slice(0, 10); // formato AAAA-MM-DD
    this.turmaId = turmaId ? Number(turmaId) : null; // no banco, turma_id pode ser NULL
    this.ativo = Boolean(ativo);
  }

  possuiTurma() {
    return this.turmaId !== null;
  }

  static fromRow(row) {
    return new Aluno({
      id: row.id,
      nome: row.nome,
      dataNascimento: row.data_nascimento,
      turmaId: row.turma_id,
      ativo: row.ativo,
    });
  }
}

module.exports = Aluno;
