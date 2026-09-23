const Usuario = require('./Usuario');
const Permissao = require('./Permissao');

class Professor extends Usuario {
  get perfil() {
    return 'professor';
  }

  get permissoes() {
    return [Permissao.REGISTRAR_ACOMPANHAMENTO, Permissao.CONSULTAR_HISTORICO];
  }
}

module.exports = Professor;
