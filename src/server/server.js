// ============================================================
// server.js
// Ponto de entrada da API. Cria o servidor Express, liga os
// middlewares globais e as rotas de cada perfil, e trata os erros
// em um lugar só.
//
// Para iniciar:  npm start        (ou "npm run dev", que reinicia
//                                  sozinho quando um arquivo muda)
//
// MUDANÇA DA ENTREGA 2: o front-end agora é um app React separado
// (pasta ../client, aulas 06 a 08 e 12). Este servidor virou SÓ a
// API: ele não entrega mais páginas HTML, apenas JSON.
// ============================================================

const express = require('express');
const cors = require('cors');

// Importar o db.js também carrega o .env (process.env.*).
const pool = require('./db');

// Rotas, separadas por assunto (cada arquivo é um express.Router).
const rotasConta = require('./rotas/conta');
const rotasGerais = require('./rotas/geral');
const rotasResponsavel = require('./rotas/responsavel');
const rotasProfessor = require('./rotas/professor');
const rotasAdmin = require('./rotas/admin');
const rotasUsuarios = require('./rotas/usuarios');

// ------------------------------------------------------------
// Confere as variáveis obrigatórias ANTES de ligar o servidor.
// Sem o JWT_SECRET, qualquer token seria aceito ou recusado de
// forma estranha; é melhor parar já, com uma mensagem clara.
// ------------------------------------------------------------
const OBRIGATORIAS = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const faltando = OBRIGATORIAS.filter((nome) => !process.env[nome]);
if (faltando.length > 0) {
  console.error('Faltam variáveis no arquivo server/.env:', faltando.join(', '));
  console.error('Copie o .env.example para .env e preencha os valores.');
  process.exit(1);
}

const app = express();

// No Render, a porta é escolhida pela plataforma (process.env.PORT).
const PORT = Number(process.env.PORT) || 3000;

// ------------------------------------------------------------
// MIDDLEWARES GLOBAIS (rodam em todo pedido)
// ------------------------------------------------------------

// CORS: o React roda em OUTRO endereço (localhost:5173 ou o
// Netlify) e a API em localhost:3000. O navegador bloqueia pedidos
// entre origens diferentes, a não ser que a API autorize. Aqui
// autorizamos SÓ o endereço do nosso front (CORS_ORIGIN), e não o
// mundo inteiro.
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',') }));

// Faz o Express entender o corpo dos pedidos em JSON (req.body).
// O limite pequeno evita que alguém mande um corpo gigante para
// derrubar o servidor.
app.use(express.json({ limit: '100kb' }));

// ------------------------------------------------------------
// ROTAS
// ------------------------------------------------------------

// Rota de saúde: confirma que a API e o banco estão no ar.
// Útil no deploy (o Render pode usar esta rota para checar a API).
app.get('/api/saude', async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ ok: true });
});

app.use('/api', rotasConta);                     // /api/login, /api/conta...
app.use('/api', rotasGerais);                    // /api/tags, /api/bimestres
app.use('/api/responsavel', rotasResponsavel);   // /api/responsavel/...
app.use('/api/professor', rotasProfessor);       // /api/professor/...
// O cadastro de usuários vem ANTES de /api/admin: o Express testa as
// rotas na ordem em que foram ligadas.
app.use('/api/admin/usuarios', rotasUsuarios);   // cadastro (RF02)
app.use('/api/admin', rotasAdmin);               // /api/admin/...

// ------------------------------------------------------------
// ROTA INEXISTENTE (404)
// Fica DEPOIS de todas as rotas: se o pedido chegou aqui, nenhuma
// rota anterior o atendeu. A página 404 "bonita" agora é do React
// (rota "*" do React Router); a API responde em JSON.
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

// ------------------------------------------------------------
// TRATADOR DE ERROS (tem 4 parâmetros: o Express reconhece por isso)
// Todo erro lançado nas rotas (throw new ErroHttp(...)) ou vindo do
// banco cai aqui. Resultado: TODAS as respostas de erro têm o mesmo
// formato { "erro": "mensagem" } (requisito da E2: "tratamento de
// erros consistente, respostas padronizadas").
// ------------------------------------------------------------
// eslint-disable-next-line no-unused-vars
app.use((erro, req, res, next) => {
  // Erros "previstos" (validação, permissão...) já têm status.
  if (erro.status && erro.status < 500) {
    return res.status(erro.status).json({ erro: erro.message });
  }
  // JSON malformado no corpo do pedido.
  if (erro.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'O corpo do pedido não é um JSON válido.' });
  }
  // Erro inesperado: o detalhe técnico vai SÓ para o terminal
  // (logs técnicos). O usuário recebe uma mensagem genérica, porque
  // mostrar erro.message poderia expor nomes de tabelas do banco.
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`, erro);
  return res.status(500).json({ erro: 'Ocorreu um erro no servidor. Tente novamente.' });
});

// ------------------------------------------------------------
// INICIALIZAÇÃO
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`API da KFKA rodando em http://localhost:${PORT}`);
});
