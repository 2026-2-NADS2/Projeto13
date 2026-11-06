const BaseRepository = require('./BaseRepository');
const Bimestre = require('../models/Bimestre');

class BimestreRepository extends BaseRepository {
  constructor(pool) {
    super(pool, 'bimestre');
  }

  async criar(bimestre) {
    const [r] = await this.pool.query(
      'INSERT INTO bimestre (numero, ano_letivo, data_abertura, data_encerramento) VALUES (?, ?, ?, ?)',
      [bimestre.numero, bimestre.anoLetivo, bimestre.abertura, bimestre.encerramento]
    );
    bimestre.id = r.insertId;
    return bimestre;
  }

  async buscarPorId(id) {
    const row = await this.buscarLinhaPorId(id);
    return row ? Bimestre.fromRow(row) : null;
  }
}

module.exports = BimestreRepository;
