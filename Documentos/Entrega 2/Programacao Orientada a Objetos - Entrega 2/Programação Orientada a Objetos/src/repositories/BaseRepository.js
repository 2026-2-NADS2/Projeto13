// Classe base dos repositórios: concentra o que todos têm em comum.
// Os repositórios são a ÚNICA camada que escreve SQL.
class BaseRepository {
  constructor(pool, tabela) {
    this.pool = pool;
    this.tabela = tabela;
  }

  // Permite rodar a query dentro de uma transação (conn) ou direto no pool
  executor(conn) {
    return conn || this.pool;
  }

  async buscarLinhaPorId(id, conn) {
    const [rows] = await this.executor(conn).query(`SELECT * FROM ${this.tabela} WHERE id = ?`, [id]);
    return rows[0] || null;
  }
}

module.exports = BaseRepository;
