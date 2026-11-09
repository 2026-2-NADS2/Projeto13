// ============================================================
// rotas/responsavel.js
// Rotas do Pai/Responsável. TODAS exigem login com perfil
// "responsavel".
//
//   GET  /api/responsavel/alunos                    -> meus alunos
//   GET  /api/responsavel/disciplinas               -> opções do filtro
//   GET  /api/responsavel/relatorios                -> lista paginada
//   GET  /api/responsavel/relatorios/:id            -> um relatório
//   POST /api/responsavel/relatorios/:id/ciencia    -> registrar ciência
//
// REGRA DE OURO (RF08 + LGPD): o responsável só vê alunos
// VINCULADOS a ele (tabela aluno_responsavel) e só relatórios
// PUBLICADOS (view vw_relatorio_publicado). Toda consulta abaixo
// tem o filtro do vínculo usando o id que veio do TOKEN.
// Isso corrige a falha da Entrega 1, em que a Mariana conseguia
// ver os relatórios do Igor, que é filho de outra família.
// ============================================================

const express = require('express');
const pool = require('../db');
const { autenticar, exigirPerfil } = require('../middlewares/autenticacao');
const {
  ErroHttp, lerInteiro, exigirId, validarTexto, MAIOR_INT,
} = require('../utilitarios/validacao');

const router = express.Router();
router.use(autenticar, exigirPerfil('responsavel'));

// Pedaço de SQL reaproveitado: "alunos deste responsável".
// O "?" recebe req.usuario.id em cada consulta.
const MEUS_ALUNOS = 'SELECT aluno_id FROM aluno_responsavel WHERE usuario_id = ?';

// ------------------------------------------------------------
// GET /api/responsavel/alunos  ->  [ { id, nome, turma } ]
// Minimização de dados (LGPD): só id, nome e turma. Nada de data
// de nascimento, que esta tela não usa.
// ------------------------------------------------------------
router.get('/alunos', async (req, res) => {
  const [alunos] = await pool.query(
    `SELECT al.id, al.nome, t.nome AS turma
       FROM aluno al
       JOIN aluno_responsavel ar ON ar.aluno_id = al.id
       LEFT JOIN turma t ON t.id = al.turma_id
      WHERE ar.usuario_id = ? AND al.ativo = TRUE
      ORDER BY al.nome`,
    [req.usuario.id]
  );
  res.json(alunos);
});

// ------------------------------------------------------------
// GET /api/responsavel/disciplinas  ->  [ "Ciências", "Matemática" ]
// Disciplinas que aparecem nos relatórios publicados dos MEUS alunos
// (preenche o <select> de filtro).
// ------------------------------------------------------------
router.get('/disciplinas', async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT DISTINCT disciplina_nome AS nome
       FROM vw_relatorio_publicado
      WHERE aluno_id IN (${MEUS_ALUNOS})
      ORDER BY disciplina_nome`,
    [req.usuario.id]
  );
  res.json(linhas.map((l) => l.nome));
});

// ------------------------------------------------------------
// GET /api/responsavel/relatorios
// Filtros opcionais: ?aluno=1&ano_letivo=2026&bimestre=3
//                    &disciplina=Matemática&pagina=1&por_pagina=10
// Resposta: { pagina, porPagina, total, totalPaginas, relatorios: [...] }
// (mesmo formato da Entrega 1, para o front continuar igual)
// ------------------------------------------------------------
router.get('/relatorios', async (req, res) => {
  const aluno = lerInteiro(req.query.aluno, 1, MAIOR_INT);
  const anoLetivo = lerInteiro(req.query.ano_letivo, 2000, 2100);
  const bimestre = lerInteiro(req.query.bimestre, 1, 4);
  const pagina = lerInteiro(req.query.pagina, 1, 100000) ?? 1;
  // O início do responsável pede só os 5 mais recentes.
  const porPagina = lerInteiro(req.query.por_pagina, 1, 50) ?? 10;
  const disciplina = typeof req.query.disciplina === 'string'
    ? req.query.disciplina.trim().slice(0, 100)
    : '';

  if ([aluno, anoLetivo, bimestre, pagina, porPagina].some(Number.isNaN)) {
    throw new ErroHttp(400, 'Filtro inválido. Verifique aluno, ano letivo, bimestre (1 a 4) e página.');
  }

  // A primeira condição é FIXA: só alunos vinculados ao usuário logado.
  // As outras entram só se o filtro foi enviado. Os valores vão
  // separados do SQL (nos "?"), o que impede SQL Injection.
  const condicoes = [`aluno_id IN (${MEUS_ALUNOS})`];
  const valores = [req.usuario.id];

  if (aluno !== null) { condicoes.push('aluno_id = ?'); valores.push(aluno); }
  if (anoLetivo !== null) { condicoes.push('ano_letivo = ?'); valores.push(anoLetivo); }
  if (bimestre !== null) { condicoes.push('bimestre_numero = ?'); valores.push(bimestre); }
  if (disciplina !== '') { condicoes.push('disciplina_nome = ?'); valores.push(disciplina); }

  const where = 'WHERE ' + condicoes.join(' AND ');

  // Total de resultados, para a paginação ("Página 1 de 2").
  const [contagem] = await pool.query(
    `SELECT COUNT(*) AS total FROM vw_relatorio_publicado ${where}`,
    valores
  );
  const total = contagem[0].total;
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  // LIMIT = quantos trazer; OFFSET = quantos pular.
  // A lista não traz a "descricao" (minimização de dados): ela só
  // aparece no detalhe.
  const [linhas] = await pool.query(
    `SELECT acompanhamento_id, aluno_id, aluno_nome, turma_nome,
            disciplina_nome, professor_nome, bimestre_numero,
            ano_letivo, media, publicado_em
       FROM vw_relatorio_publicado
       ${where}
      ORDER BY publicado_em DESC, acompanhamento_id DESC
      LIMIT ? OFFSET ?`,
    [...valores, porPagina, (pagina - 1) * porPagina]
  );

  res.json({
    pagina,
    porPagina,
    total,
    totalPaginas,
    relatorios: linhas.map((l) => ({
      id: l.acompanhamento_id,
      alunoId: l.aluno_id,
      aluno: l.aluno_nome,
      turma: l.turma_nome,
      disciplina: l.disciplina_nome,
      professor: l.professor_nome,
      bimestre: l.bimestre_numero,
      anoLetivo: l.ano_letivo,
      media: Number(l.media), // DECIMAL chega como texto ("8.50")
      publicadoEm: l.publicado_em,
    })),
  });
});

// ------------------------------------------------------------
// Função auxiliar: busca UM relatório publicado de um aluno meu.
// Se não existir, não estiver publicado OU for de outra família,
// responde 404 com a mesma mensagem. Não dizemos "existe, mas não é
// seu", porque isso já revelaria que o relatório existe.
// ------------------------------------------------------------
async function buscarRelatorioDoResponsavel(idRelatorio, idResponsavel) {
  const [linhas] = await pool.query(
    `SELECT * FROM vw_relatorio_publicado
      WHERE acompanhamento_id = ? AND aluno_id IN (${MEUS_ALUNOS})`,
    [idRelatorio, idResponsavel]
  );
  if (linhas.length === 0) {
    throw new ErroHttp(404, 'Relatório não encontrado ou você não tem acesso a ele.');
  }
  return linhas[0];
}

// ------------------------------------------------------------
// GET /api/responsavel/relatorios/:id
// Um relatório completo: dados + descrição + tags + ciência.
// ------------------------------------------------------------
router.get('/relatorios/:id', async (req, res) => {
  const id = exigirId(req.params.id);
  const r = await buscarRelatorioDoResponsavel(id, req.usuario.id);

  const [tags] = await pool.query(
    `SELECT t.nome FROM acomp_tag at
       JOIN tag t ON t.id = at.tag_id
      WHERE at.acompanhamento_id = ?
      ORDER BY t.nome`,
    [id]
  );

  // A ciência DESTE responsável (o outro responsável do aluno tem a sua).
  const [ciencias] = await pool.query(
    'SELECT registrada_em, observacao FROM ciencia WHERE acompanhamento_id = ? AND responsavel_id = ?',
    [id, req.usuario.id]
  );

  res.json({
    id: r.acompanhamento_id,
    aluno: r.aluno_nome,
    turma: r.turma_nome,
    disciplina: r.disciplina_nome,
    professor: r.professor_nome,
    bimestre: r.bimestre_numero,
    anoLetivo: r.ano_letivo,
    media: Number(r.media),
    descricao: r.descricao,
    publicadoEm: r.publicado_em,
    tags: tags.map((t) => t.nome),
    ciencia: ciencias[0]
      ? { registradaEm: ciencias[0].registrada_em, observacao: ciencias[0].observacao }
      : null,
  });
});

// ------------------------------------------------------------
// POST /api/responsavel/relatorios/:id/ciencia   (RF12)
// Pedido : { "observacao": "texto opcional (até 500)" }
// Sucesso: 201 { registradaEm, observacao }
// Erros  : 404 (sem acesso), 409 (já registrada)
// ------------------------------------------------------------
router.post('/relatorios/:id/ciencia', async (req, res) => {
  const id = exigirId(req.params.id);
  const observacao = validarTexto((req.body || {}).observacao, { nome: 'Observação', maximo: 500 });

  await buscarRelatorioDoResponsavel(id, req.usuario.id);

  try {
    await pool.query(
      'INSERT INTO ciencia (acompanhamento_id, responsavel_id, observacao) VALUES (?, ?, ?)',
      [id, req.usuario.id, observacao]
    );
  } catch (erro) {
    // A chave única (acompanhamento_id, responsavel_id) impede a
    // segunda ciência. O MySQL avisa com o código ER_DUP_ENTRY.
    if (erro.code === 'ER_DUP_ENTRY') {
      throw new ErroHttp(409, 'Você já registrou ciência deste relatório.');
    }
    throw erro;
  }

  const [linhas] = await pool.query(
    'SELECT registrada_em, observacao FROM ciencia WHERE acompanhamento_id = ? AND responsavel_id = ?',
    [id, req.usuario.id]
  );
  // 201 = "criado".
  res.status(201).json({ registradaEm: linhas[0].registrada_em, observacao: linhas[0].observacao });
});

module.exports = router;
