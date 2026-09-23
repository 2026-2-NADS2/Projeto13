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
}

module.exports = UsuarioRepository;
