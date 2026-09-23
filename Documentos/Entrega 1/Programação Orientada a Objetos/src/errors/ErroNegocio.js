// Erro de regra de negócio, já com o status HTTP que a API deve devolver
class ErroNegocio extends Error {
  constructor(mensagem, status = 400) {
    super(mensagem);
    this.name = 'ErroNegocio';
    this.status = status;
  }
}

module.exports = ErroNegocio;
