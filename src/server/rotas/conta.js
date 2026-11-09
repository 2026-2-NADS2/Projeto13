// ============================================================
// rotas/conta.js
// Login e "Minha conta" (as três contas usam as mesmas rotas).
//
//   POST /api/login        -> confere e-mail e senha, devolve o token
//   GET  /api/conta        -> dados do usuário logado
//   PUT  /api/conta/senha  -> troca a senha
//
// express.Router() cria um "mini-app" só com estas rotas. O
// server.js liga este arquivo em /api com app.use('/api', ...).
// Separar as rotas em arquivos por assunto é a "separação de
// responsabilidades em camadas" pedida no PI (manutenibilidade).
// ============================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { autenticar } = require('../middlewares/autenticacao');
const { ErroHttp, conferirRegrasDaSenha } = require('../utilitarios/validacao');

const router = express.Router();

// Hash "de mentira", comparado quando o e-mail não existe no banco.
// Sem isso, um e-mail inexistente responderia mais rápido que um
// e-mail existente com senha errada, e essa diferença de tempo
// daria pista de quais e-mails estão cadastrados.
const HASH_FALSO = '$2b$10$jMNpXuJcGwKO4zNIAeoZp.egeKeoB/QzNyqrJe0CywY2gfdB2H6xO';

// ------------------------------------------------------------
// POST /api/login
// Pedido : { "email": "...", "senha": "..." }
// Sucesso: 200 { "token": "eyJ...", "usuario": { id, nome, perfil } }
// Erros  : 400 (faltou campo), 401 (não confere)
// ------------------------------------------------------------
router.post('/login', async (req, res) => {
  // "|| {}" evita erro se o corpo não vier em JSON.
  const { email, senha } = req.body || {};

  if (typeof email !== 'string' || typeof senha !== 'string' ||
      email.trim() === '' || senha === '') {
    throw new ErroHttp(400, 'Informe e-mail e senha.');
  }

  // O "?" é preenchido pelo mysql2 com segurança: impede SQL Injection.
  const [linhas] = await pool.query(
    'SELECT id, nome, senha_hash, perfil FROM usuario WHERE email = ? AND ativo = TRUE',
    [email.trim()]
  );
  const usuario = linhas[0];

  // bcrypt.compare refaz o hash da senha digitada e compara com o do
  // banco. A senha original nunca é guardada (requisito: hash seguro).
  const senhaConfere = await bcrypt.compare(senha, usuario ? usuario.senha_hash : HASH_FALSO);

  // Mesma mensagem para "e-mail não existe" e "senha errada".
  if (!usuario || !senhaConfere) {
    throw new ErroHttp(401, 'E-mail ou senha inválidos.');
  }

  // Cria o token. Dentro dele vão só id, perfil e nome (o token pode
  // ser lido por quem o tem; NUNCA coloque senha ou dados sensíveis).
  // expiresIn faz o login vencer sozinho (sessão com expiração).
  const token = jwt.sign(
    { id: usuario.id, perfil: usuario.perfil, nome: usuario.nome },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRA || '2h' }
  );

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil },
  });
});

// ------------------------------------------------------------
// GET /api/conta  (precisa estar logado)
// Devolve nome e e-mail de quem está logado. O id vem do TOKEN
// (req.usuario), e não da URL: assim ninguém vê a conta de outro.
// ------------------------------------------------------------
router.get('/conta', autenticar, async (req, res) => {
  const [linhas] = await pool.query(
    'SELECT nome, email, perfil FROM usuario WHERE id = ? AND ativo = TRUE',
    [req.usuario.id]
  );
  if (linhas.length === 0) throw new ErroHttp(404, 'Conta não encontrada.');
  res.json(linhas[0]);
});

// As regras de senha por perfil ficam em utilitarios/validacao.js
// (conferirRegrasDaSenha), porque o cadastro de usuário também usa.

// ------------------------------------------------------------
// PUT /api/conta/senha
// Pedido : { "senhaAtual": "...", "senhaNova": "..." }
// Sucesso: 200 { "mensagem": "Senha alterada com sucesso." }
// Pedir a senha atual impede que outra pessoa troque a senha num
// computador que ficou logado.
// ------------------------------------------------------------
router.put('/conta/senha', autenticar, async (req, res) => {
  const { senhaAtual, senhaNova } = req.body || {};
  if (typeof senhaAtual !== 'string' || typeof senhaNova !== 'string' ||
      senhaAtual === '' || senhaNova === '') {
    throw new ErroHttp(400, 'Informe a senha atual e a nova senha.');
  }

  const problema = conferirRegrasDaSenha(senhaNova, req.usuario.perfil);
  if (problema) throw new ErroHttp(400, problema);

  const [linhas] = await pool.query('SELECT senha_hash FROM usuario WHERE id = ?', [req.usuario.id]);
  if (linhas.length === 0) throw new ErroHttp(404, 'Conta não encontrada.');

  const atualConfere = await bcrypt.compare(senhaAtual, linhas[0].senha_hash);
  if (!atualConfere) throw new ErroHttp(400, 'A senha atual está incorreta.');

  if (senhaAtual === senhaNova) {
    throw new ErroHttp(400, 'A nova senha precisa ser diferente da atual.');
  }

  // bcrypt.hash com custo 10: gera o hash com "sal" aleatório.
  const novoHash = await bcrypt.hash(senhaNova, 10);
  await pool.query('UPDATE usuario SET senha_hash = ? WHERE id = ?', [novoHash, req.usuario.id]);

  res.json({ mensagem: 'Senha alterada com sucesso.' });
});

module.exports = router;
