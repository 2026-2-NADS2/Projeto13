// ============================================================
// rotas/geral.js
// Dados de apoio usados por mais de um perfil:
//   GET /api/tags       -> tags cadastradas (professor e admin)
//   GET /api/bimestres  -> os 4 bimestres e se estão abertos
// ============================================================

const express = require('express');
const pool = require('../db');
const { autenticar, exigirPerfil } = require('../middlewares/autenticacao');
const { lerInteiro, ErroHttp } = require('../utilitarios/validacao');

const router = express.Router();

// Só professor e administrador logados podem usar estas rotas.
// ATENÇÃO: aqui NÃO dá para usar router.use(...), como nos outros
// arquivos. Este router é ligado em "/api" (sem prefixo próprio) e
// router.use valeria para TODO pedido que passasse por ele, inclusive
// /api/responsavel/..., bloqueando o responsável. Por isso o porteiro
// vai em cada rota, como segundo argumento.
const somenteEquipe = [autenticar, exigirPerfil('professor', 'administrador')];

// ------------------------------------------------------------
// GET /api/tags  ->  [ { id, nome } ]
// ------------------------------------------------------------
router.get('/tags', somenteEquipe, async (req, res) => {
  const [tags] = await pool.query('SELECT id, nome FROM tag ORDER BY nome');
  res.json(tags);
});

// ------------------------------------------------------------
// GET /api/bimestres?ano=2026
// [ { id, numero, anoLetivo, abertura, encerramento, aberto } ]
//
// As datas saem como TEXTO no formato "2026-11-01T00:00", já no
// horário da escola (DATE_FORMAT no próprio MySQL). É exatamente o
// formato que o <input type="datetime-local"> do React usa.
// "aberto" é calculado pelo banco: agora está entre abertura e
// encerramento? (regra de negócio: o professor só digita no período)
// ------------------------------------------------------------
router.get('/bimestres', somenteEquipe, async (req, res) => {
  const ano = lerInteiro(req.query.ano, 2000, 2100);
  if (Number.isNaN(ano)) throw new ErroHttp(400, 'Ano inválido.');

  const [linhas] = await pool.query(
    `SELECT id, numero, ano_letivo AS anoLetivo,
            DATE_FORMAT(data_abertura, '%Y-%m-%dT%H:%i') AS abertura,
            DATE_FORMAT(data_encerramento, '%Y-%m-%dT%H:%i') AS encerramento,
            (NOW() BETWEEN data_abertura AND data_encerramento) AS aberto
       FROM bimestre
      WHERE ano_letivo = COALESCE(?, YEAR(NOW()))
      ORDER BY numero`,
    [ano]
  );

  // O MySQL devolve o "aberto" como 0/1; !! transforma em true/false.
  res.json(linhas.map((b) => ({ ...b, aberto: !!b.aberto })));
});

module.exports = router;
