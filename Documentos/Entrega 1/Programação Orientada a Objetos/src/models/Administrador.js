const Usuario = require('./Usuario');
const Permissao = require('./Permissao');

class Administrador extends Usuario {
  get perfil() {
    return 'administrador';
  }

  get permissoes() {
    return [
      Permissao.GERENCIAR_CADASTROS,
      Permissao.GERENCIAR_BIMESTRES,
      Permissao.REVISAR_ACOMPANHAMENTO,
      Permissao.CONSULTAR_HISTORICO,
    ];
  }
}

module.exports = Administrador;
