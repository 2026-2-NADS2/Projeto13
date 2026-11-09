// ============================================================
// middlewares/autenticacao.js
// "Middleware" é uma função que o Express roda ANTES da rota. Ela
// recebe (req, res, next) e decide:
//   - chamar next()  -> deixa o pedido seguir para a rota;
//   - responder erro -> o pedido para aqui e a rota nem roda.
//
// Aqui ficam os dois "porteiros" da API:
//   1. autenticar      -> "QUEM é você?"  (confere o token)  -> 401
//   2. exigirPerfil()  -> "Você PODE entrar aqui?" (perfil)  -> 403
//
// Isto é a segurança de verdade do sistema. O React esconde menus
// e redireciona telas só por conforto; quem protege os dados das
// crianças (LGPD) é este arquivo + os filtros dentro de cada rota.
// ============================================================

const jwt = require('jsonwebtoken');
const { ErroHttp } = require('../utilitarios/validacao');

// ------------------------------------------------------------
// COMO FUNCIONA O TOKEN (JWT - JSON Web Token)
//
// 1. No login, o servidor confere a senha e cria um token com
//    jwt.sign({ id, perfil, nome }, JWT_SECRET). O token é um texto
//    com 3 partes: dados + validade + ASSINATURA.
// 2. O React guarda o token e o manda em todo pedido, no cabeçalho:
//       Authorization: Bearer eyJhbGciOi...
// 3. Aqui, jwt.verify confere a assinatura com a MESMA chave
//    secreta. Se alguém alterar o token (ex.: trocar "responsavel"
//    por "administrador"), a assinatura não bate e o verify falha.
//    Só quem tem o JWT_SECRET (o servidor) consegue criar tokens.
//
// Por que não há proteção CSRF? CSRF acontece quando o navegador
// manda um COOKIE automaticamente para outro site. O token aqui NÃO
// é cookie: o próprio React coloca no cabeçalho, e outro site não
// consegue fazer isso. Por isso o modelo com Bearer token já evita
// CSRF (requisito de segurança do PI).
// ------------------------------------------------------------

function autenticar(req, res, next) {
  // O cabeçalho chega como "Bearer <token>". Separamos pelo espaço.
  const cabecalho = req.headers.authorization || '';
  const [tipo, token] = cabecalho.split(' ');

  if (tipo !== 'Bearer' || !token) {
    // 401 = "não autenticado": falta o login.
    return next(new ErroHttp(401, 'Faça login para continuar.'));
  }

  try {
    // Se a assinatura for falsa ou o token tiver vencido
    // (JWT_EXPIRA), jwt.verify lança um erro.
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Guarda quem está logado em req.usuario. Todas as rotas
    // seguintes leem daqui, por exemplo: req.usuario.id.
    // NUNCA usamos um id que vem do corpo ou da URL para saber
    // "quem sou eu": ele poderia ser trocado pelo usuário.
    req.usuario = { id: dados.id, perfil: dados.perfil, nome: dados.nome };
    return next();
  } catch (erro) {
    return next(new ErroHttp(401, 'Sua sessão expirou. Entre novamente.'));
  }
}

// ------------------------------------------------------------
// exigirPerfil('administrador') devolve um middleware que só deixa
// passar quem tem aquele perfil. "...perfis" (rest) permite passar
// mais de um: exigirPerfil('professor', 'administrador').
// Princípio do menor privilégio: cada perfil só alcança as rotas
// de que precisa.
// ------------------------------------------------------------
function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!req.usuario || !perfis.includes(req.usuario.perfil)) {
      // 403 = "proibido": está logado, mas não tem permissão.
      return next(new ErroHttp(403, 'Você não tem permissão para acessar este recurso.'));
    }
    return next();
  };
}

module.exports = { autenticar, exigirPerfil };
