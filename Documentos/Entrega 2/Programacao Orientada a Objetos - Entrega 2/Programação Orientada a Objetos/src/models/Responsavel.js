const Usuario = require('./Usuario');
const Permissao = require('./Permissao');

class Responsavel extends Usuario {
  get perfil() {
    return 'responsavel';
  }

  get permissoes() {
    return [Permissao.VER_RELATORIOS_PUBLICADOS, Permissao.REGISTRAR_CIENCIA];
  }
}

module.exports = Responsavel;
