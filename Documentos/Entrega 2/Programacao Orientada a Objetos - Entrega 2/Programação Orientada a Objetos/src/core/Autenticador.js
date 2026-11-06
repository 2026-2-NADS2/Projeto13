const jwt = require('jsonwebtoken');
const ErroNegocio = require('../errors/ErroNegocio');

// Gera e confere o token de login (JWT). O token guarda só o id e o perfil.
class Autenticador {
  #segredo;
  #validade;

  constructor(segredo, validade = '8h') {
    if (!segredo) throw new Error('Defina JWT_SECRET no arquivo .env');
    this.#segredo = segredo;
    this.#validade = validade;
  }

  gerarToken(usuario) {
    return jwt.sign({ id: usuario.id, perfil: usuario.perfil }, this.#segredo, { expiresIn: this.#validade });
  }

  // Lê o cabeçalho "Authorization: Bearer <token>" e devolve o id do usuário
  lerUsuarioId(cabecalho) {
    const [tipo, token] = String(cabecalho || '').split(' ');
    if (tipo !== 'Bearer' || !token) throw new ErroNegocio('Faça login e envie o token (Authorization: Bearer ...)', 401);
    try {
      return jwt.verify(token, this.#segredo).id;
    } catch {
      throw new ErroNegocio('Sessão expirada ou token inválido. Faça login de novo.', 401);
    }
  }
}

module.exports = Autenticador;
