const BaseRepository = require('./BaseRepository');

class CienciaRepository extends BaseRepository {
  constructor(pool) {
    super(pool, 'ciencia');
  }

  async criar(ciencia) {
    const [r] = await this.pool.query(
      'INSERT INTO ciencia (acompanhamento_id, responsavel_id, observacao) VALUES (?, ?, ?)',
      [ciencia.acompanhamentoId, ciencia.responsavelId, ciencia.observacao]
    );
    ciencia.id = r.insertId;
    return ciencia;
  }

  async listarDoAcompanhamento(acompanhamentoId) {
    const [rows] = await this.pool.query(
      `SELECT c.id, c.observacao, c.registrada_em, u.nome AS responsavel
         FROM ciencia c
         JOIN usuario u ON u.id = c.responsavel_id
        WHERE c.acompanhamento_id = ?
        ORDER BY c.registrada_em`,
      [acompanhamentoId]
    );
    return rows;
  }
}

module.exports = CienciaRepository;
