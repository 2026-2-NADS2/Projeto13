const BaseRepository = require('./BaseRepository');
const UsuarioFactory = require('../models/UsuarioFactory');

class UsuarioRepository extends BaseRepository {
  constructor(pool) {
    super(pool, 'usuario');
  }

  async buscarPorId(id) {
    const row = await this.buscarLinhaPorId(id);
    return row ? UsuarioFactory.criar(row) : null;
  }

  async buscarPorEmail(email) {
    const [rows] = await this.pool.query('SELECT * FROM usuario WHERE email = ?', [String(email).trim().toLowerCase()]);
    return rows[0] ? UsuarioFactory.criar(rows[0]) : null;
  }
}

module.exports = UsuarioRepository;
