const ErroNegocio = require('../errors/ErroNegocio');

// Converte qualquer erro em uma resposta HTTP com o status correto
module.exports = (err, req, res, next) => {
  if (err instanceof ErroNegocio) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Registro duplicado' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'Referência inexistente (verifique os IDs informados)' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
};
