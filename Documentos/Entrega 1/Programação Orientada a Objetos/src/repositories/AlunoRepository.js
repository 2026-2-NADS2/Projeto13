const BaseRepository = require('./BaseRepository');
const Aluno = require('../models/Aluno');

class AlunoRepository extends BaseRepository {
  constructor(pool) {
    super(pool, 'aluno');
  }

  async criar(aluno) {
    const [r] = await this.pool.query(
      'INSERT INTO aluno (nome, data_nascimento, turma_id, ativo) VALUES (?, ?, ?, ?)',
      [aluno.nome, aluno.dataNascimento, aluno.turmaId, aluno.ativo]
    );
    aluno.id = r.insertId;
    return aluno;
  }

  async listar() {
    const [rows] = await this.pool.query('SELECT * FROM aluno ORDER BY nome');
    return rows.map(Aluno.fromRow);
  }

  async buscarPorId(id) {
    const row = await this.buscarLinhaPorId(id);
    return row ? Aluno.fromRow(row) : null;
  }
}

module.exports = AlunoRepository;
