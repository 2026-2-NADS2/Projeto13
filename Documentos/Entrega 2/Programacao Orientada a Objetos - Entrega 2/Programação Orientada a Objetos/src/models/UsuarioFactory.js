const Administrador = require('./Administrador');
const Professor = require('./Professor');
const Responsavel = require('./Responsavel');

// Padrão FACTORY: transforma a linha do banco no objeto da subclasse certa
const CLASSES_POR_PERFIL = {
  administrador: Administrador,
  professor: Professor,
  responsavel: Responsavel,
};

class UsuarioFactory {
  static criar(row) {
    const Classe = CLASSES_POR_PERFIL[row.perfil];
    if (!Classe) throw new Error(`Perfil desconhecido: ${row.perfil}`);
    return new Classe({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senha_hash,
      ativo: row.ativo,
    });
  }
}

module.exports = UsuarioFactory;
