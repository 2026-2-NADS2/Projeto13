// ============================================================
// rotas/admin.js
// Rotas do Administrador (coordenação). TODAS exigem login com
// perfil "administrador".
//
//   GET  /api/admin/resumo                              -> números do painel
//   GET  /api/admin/filtros                             -> opções dos <select>
//   GET  /api/admin/acompanhamentos                     -> lista paginada com filtros
//        (status=aguardando traz enviados + em revisão)
//   GET  /api/admin/acompanhamentos/exportar            -> mesma lista em CSV (Excel) - RF11
//   GET  /api/admin/acompanhamentos/:id                 -> um registro
//   PUT  /api/admin/acompanhamentos/:id                 -> alterar conteúdo (com justificativa)
//   POST /api/admin/acompanhamentos/:id/decisao         -> publicar / devolver / cancelar
//   GET  /api/admin/acompanhamentos/:id/historico       -> auditoria (RF07)
//   PUT  /api/admin/bimestres/:id                       -> período de digitação (RF04)
// ============================================================

const express = require('express');
const pool = require('../db');
const { autenticar, exigirPerfil } = require('../middlewares/autenticacao');
const FluxoAcompanhamento = require('../modelos/FluxoAcompanhamento');
const {
  ErroHttp, lerInteiro, exigirId, validarMedia, validarTexto, validarTags, STATUS_VALIDOS, MAIOR_INT,
} = require('../utilitarios/validacao');

const router = express.Router();
router.use(autenticar, exigirPerfil('administrador'));

const fluxo = new FluxoAcompanhamento(pool);

// ------------------------------------------------------------
// GET /api/admin/resumo
// { bimestre: { numero, anoLetivo, aberto, encerramento } | null,
//   aguardando, alunosAtivos, professoresAtivos }
// ------------------------------------------------------------
router.get('/resumo', async (req, res) => {
  // Bimestre "atual": o que está aberto agora; se nenhum estiver, o
  // próximo a abrir. ORDER BY com a condição primeiro faz o aberto
  // (1) aparecer antes dos fechados (0).
  const [bimestres] = await pool.query(
    `SELECT numero, ano_letivo AS anoLetivo,
            DATE_FORMAT(data_abertura, '%Y-%m-%dT%H:%i') AS abertura,
            DATE_FORMAT(data_encerramento, '%Y-%m-%dT%H:%i') AS encerramento,
            (NOW() BETWEEN data_abertura AND data_encerramento) AS aberto
       FROM bimestre
      WHERE data_encerramento >= NOW()
      ORDER BY aberto DESC, data_abertura
      LIMIT 1`
  );
  const [[{ aguardando }]] = await pool.query(
    "SELECT COUNT(*) AS aguardando FROM acompanhamento WHERE status IN ('enviado_revisao', 'em_revisao')"
  );
  const [[{ alunosAtivos }]] = await pool.query('SELECT COUNT(*) AS alunosAtivos FROM aluno WHERE ativo = TRUE');
  const [[{ professoresAtivos }]] = await pool.query(
    "SELECT COUNT(*) AS professoresAtivos FROM usuario WHERE perfil = 'professor' AND ativo = TRUE"
  );

  res.json({
    bimestre: bimestres[0] ? { ...bimestres[0], aberto: !!bimestres[0].aberto } : null,
    aguardando,
    alunosAtivos,
    professoresAtivos,
  });
});

// ------------------------------------------------------------
// GET /api/admin/filtros  ->  { turmas, disciplinas, professores }
// Cada item é { id, nome }. Preenche os <select> da tela de revisão.
// ------------------------------------------------------------
router.get('/filtros', async (req, res) => {
  const [turmas] = await pool.query('SELECT id, nome FROM turma ORDER BY ano_letivo DESC, nome');
  const [disciplinas] = await pool.query('SELECT id, nome FROM disciplina ORDER BY nome');
  const [professores] = await pool.query(
    "SELECT id, nome FROM usuario WHERE perfil = 'professor' ORDER BY nome"
  );
  res.json({ turmas, disciplinas, professores });
});

// ------------------------------------------------------------
// Auxiliar: monta o WHERE a partir dos filtros da URL. É usado pela
// lista paginada E pela exportação, para que o CSV traga exatamente
// o que está na tela.
// ------------------------------------------------------------
function montarFiltros(query) {
  const status = query.status || '';
  const turma = lerInteiro(query.turma, 1, MAIOR_INT);
  const disciplina = lerInteiro(query.disciplina, 1, MAIOR_INT);
  const professor = lerInteiro(query.professor, 1, MAIOR_INT);
  const bimestre = lerInteiro(query.bimestre, 1, 4);
  const ano = lerInteiro(query.ano, 2000, 2100);
  const nomeAluno = typeof query.aluno === 'string' ? query.aluno.trim().slice(0, 150) : '';

  // "aguardando" é um filtro especial: enviados + em revisão (o que
  // ainda depende da coordenação). Os outros são os status do banco.
  if (status !== '' && status !== 'aguardando' && !STATUS_VALIDOS.includes(status)) {
    throw new ErroHttp(400, 'Status inválido.');
  }
  if ([turma, disciplina, professor, bimestre, ano].some(Number.isNaN)) {
    throw new ErroHttp(400, 'Filtro inválido.');
  }

  const condicoes = [];
  const valores = [];
  if (status === 'aguardando') {
    condicoes.push("ac.status IN ('enviado_revisao', 'em_revisao')");
  } else if (status) {
    condicoes.push('ac.status = ?');
    valores.push(status);
  }
  if (turma !== null) { condicoes.push('ac.turma_id = ?'); valores.push(turma); }
  if (disciplina !== null) { condicoes.push('ac.disciplina_id = ?'); valores.push(disciplina); }
  if (professor !== null) { condicoes.push('ac.professor_id = ?'); valores.push(professor); }
  if (bimestre !== null) { condicoes.push('b.numero = ?'); valores.push(bimestre); }
  if (ano !== null) { condicoes.push('b.ano_letivo = ?'); valores.push(ano); }
  if (nomeAluno) {
    // Busca por "pedaço" do nome. Os caracteres % e _ têm significado
    // especial no LIKE; a barra os transforma em texto comum.
    condicoes.push('al.nome LIKE ?');
    valores.push('%' + nomeAluno.replace(/[\\%_]/g, '\\$&') + '%');
  }
  return {
    where: condicoes.length ? 'WHERE ' + condicoes.join(' AND ') : '',
    valores,
  };
}

// O mesmo FROM/JOIN das duas consultas da lista.
const FROM_LISTA = `
  FROM acompanhamento ac
  JOIN aluno al ON al.id = ac.aluno_id
  JOIN turma t ON t.id = ac.turma_id
  JOIN disciplina d ON d.id = ac.disciplina_id
  JOIN usuario p ON p.id = ac.professor_id
  JOIN bimestre b ON b.id = ac.bimestre_id`;

const CAMPOS_LISTA = `
  ac.id, al.nome AS aluno, t.nome AS turma, d.nome AS disciplina, p.nome AS professor,
  b.numero AS bimestre, b.ano_letivo AS anoLetivo, ac.media, ac.status,
  ac.atualizado_em AS atualizadoEm`;

// ------------------------------------------------------------
// GET /api/admin/acompanhamentos?status=&turma=&disciplina=
//      &professor=&bimestre=&ano=&aluno=&pagina=&por_pagina=
// ------------------------------------------------------------
router.get('/acompanhamentos', async (req, res) => {
  const { where, valores } = montarFiltros(req.query);
  const pagina = lerInteiro(req.query.pagina, 1, 100000) ?? 1;
  const porPagina = lerInteiro(req.query.por_pagina, 1, 50) ?? 10;
  if (Number.isNaN(pagina) || Number.isNaN(porPagina)) throw new ErroHttp(400, 'Página inválida.');

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${FROM_LISTA} ${where}`, valores);
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_LISTA} ${FROM_LISTA} ${where}
      ORDER BY ac.atualizado_em DESC, ac.id DESC
      LIMIT ? OFFSET ?`,
    [...valores, porPagina, (pagina - 1) * porPagina]
  );

  res.json({
    pagina,
    porPagina,
    total,
    totalPaginas: Math.max(1, Math.ceil(total / porPagina)),
    acompanhamentos: linhas.map((l) => ({ ...l, media: Number(l.media) })),
  });
});

// ------------------------------------------------------------
// GET /api/admin/acompanhamentos/exportar   (RF11)
// Mesmos filtros da lista, sem paginação, em CSV que o Excel abre.
//
// IMPORTANTE: esta rota fica ANTES de "/acompanhamentos/:id". O
// Express testa as rotas na ordem; se ela viesse depois, a palavra
// "exportar" seria entendida como um :id.
//
// LGPD: exporta só o necessário para gestão. A descrição (texto
// longo sobre a criança) NÃO vai para a planilha.
// ------------------------------------------------------------
const NOMES_STATUS = {
  rascunho: 'Rascunho',
  enviado_revisao: 'Enviado para revisão',
  em_revisao: 'Em revisão',
  publicado: 'Publicado',
  devolvido: 'Devolvido para ajustes',
  cancelado: 'Cancelado',
};

// Uma célula do CSV. Aspas por volta e aspas internas dobradas
// (regra do formato CSV). Textos que começam com = + - @ ganham um
// apóstrofo na frente: sem isso, o Excel executaria o texto como
// FÓRMULA ("CSV injection").
function celula(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor);
  if (/^[=+\-@\t\r]/.test(texto)) texto = "'" + texto;
  return '"' + texto.replace(/"/g, '""') + '"';
}

router.get('/acompanhamentos/exportar', async (req, res) => {
  const { where, valores } = montarFiltros(req.query);
  const [linhas] = await pool.query(
    `SELECT ${CAMPOS_LISTA} ${FROM_LISTA} ${where}
      ORDER BY t.nome, al.nome, d.nome, b.numero
      LIMIT 10000`,
    valores
  );

  const cabecalho = ['Aluno', 'Turma', 'Disciplina', 'Professor(a)', 'Bimestre', 'Ano letivo', 'Média', 'Status', 'Atualizado em'];
  const corpo = linhas.map((l) => [
    l.aluno,
    l.turma,
    l.disciplina,
    l.professor,
    `${l.bimestre}º bimestre`,
    l.anoLetivo,
    Number(l.media).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    NOMES_STATUS[l.status],
    l.atualizadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  ]);

  // Excel em português usa ";" para separar colunas (a vírgula é a
  // casa decimal). O "﻿" (BOM) no início avisa ao Excel que o
  // arquivo é UTF-8; sem ele, os acentos aparecem quebrados.
  const csv = '﻿' + [cabecalho, ...corpo].map((linha) => linha.map(celula).join(';')).join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="acompanhamentos-kfka.csv"');
  res.send(csv);
});

// ------------------------------------------------------------
// Auxiliar: um acompanhamento com os dados da revisão.
// ------------------------------------------------------------
async function buscarAcompanhamento(conexao, id, comTrava = false) {
  const [linhas] = await conexao.query(
    `SELECT ac.id, ac.status, ac.descricao, ac.media,
            al.nome AS aluno, t.nome AS turma, d.nome AS disciplina, p.nome AS professor,
            b.numero AS bimestre, b.ano_letivo AS anoLetivo
       FROM acompanhamento ac
       JOIN aluno al ON al.id = ac.aluno_id
       JOIN turma t ON t.id = ac.turma_id
       JOIN disciplina d ON d.id = ac.disciplina_id
       JOIN usuario p ON p.id = ac.professor_id
       JOIN bimestre b ON b.id = ac.bimestre_id
      WHERE ac.id = ?
      ${comTrava ? 'FOR UPDATE' : ''}`,
    [id]
  );
  if (linhas.length === 0) throw new ErroHttp(404, 'Acompanhamento não encontrado.');
  return { ...linhas[0], media: Number(linhas[0].media) };
}

async function buscarTags(conexao, id) {
  const [tags] = await conexao.query('SELECT tag_id FROM acomp_tag WHERE acompanhamento_id = ? ORDER BY tag_id', [id]);
  return tags.map((t) => t.tag_id);
}

async function detalhar(id) {
  const ac = await buscarAcompanhamento(pool, id);
  const tags = await buscarTags(pool, id);
  const [ciencias] = await pool.query(
    `SELECT u.nome AS responsavel, c.registrada_em AS registradaEm, c.observacao
       FROM ciencia c JOIN usuario u ON u.id = c.responsavel_id
      WHERE c.acompanhamento_id = ? ORDER BY c.registrada_em`,
    [id]
  );
  return {
    ...ac,
    tags,
    ciencias,
    // Dizem à tela quais formulários mostrar habilitados.
    editavel: FluxoAcompanhamento.editavelPeloAdmin(ac.status),
    decisoes: FluxoAcompanhamento.TRANSICOES.administrador[ac.status]?.filter((s) => s !== 'em_revisao') ?? [],
  };
}

router.get('/acompanhamentos/:id', async (req, res) => {
  res.json(await detalhar(exigirId(req.params.id)));
});

// ------------------------------------------------------------
// PUT /api/admin/acompanhamentos/:id
// Pedido: { descricao, media, tags: [..], justificativa }
// O admin pode corrigir o texto antes de publicar (RF06), mas toda
// alteração precisa de justificativa e fica no histórico (RF07).
// O registro passa para "Em revisão".
// ------------------------------------------------------------
router.put('/acompanhamentos/:id', async (req, res) => {
  const id = exigirId(req.params.id);
  const corpo = req.body || {};
  const descricao = validarTexto(corpo.descricao, { nome: 'Descrição', obrigatorio: true, maximo: 2000 });
  const media = validarMedia(corpo.media);
  const tags = validarTags(corpo.tags);
  const justificativa = validarTexto(corpo.justificativa, { nome: 'Justificativa', maximo: 500 });

  await fluxo.emTransacao(async (conexao) => {
    const ac = await buscarAcompanhamento(conexao, id, true);
    if (!FluxoAcompanhamento.editavelPeloAdmin(ac.status)) {
      throw new ErroHttp(409, 'Só é possível alterar acompanhamentos enviados ou em revisão.');
    }

    // O que mudou? Compara com o que está no banco. As tags são
    // comparadas como listas ordenadas ([3,1] é igual a [1,3]).
    const tagsAtuais = await buscarTags(conexao, id);
    const mudou =
      descricao !== ac.descricao ||
      media !== ac.media ||
      JSON.stringify([...tags].sort((a, b) => a - b)) !== JSON.stringify(tagsAtuais);

    if (!mudou) throw new ErroHttp(400, 'Nenhuma alteração foi feita.');
    if (!justificativa) throw new ErroHttp(400, 'Informe a justificativa da alteração.');

    await conexao.query('UPDATE acompanhamento SET descricao = ?, media = ? WHERE id = ?', [descricao, media, id]);
    await fluxo.substituirTags(conexao, id, tags);
    await fluxo.mudarStatus(conexao, {
      acompanhamento: ac,
      usuario: req.usuario,
      para: 'em_revisao',
      observacao: 'Alteração de conteúdo: ' + justificativa,
    });
  });

  res.json(await detalhar(id));
});

// ------------------------------------------------------------
// POST /api/admin/acompanhamentos/:id/decisao
// Pedido: { decisao: "publicado" | "devolvido" | "cancelado", motivo }
// O motivo é obrigatório para devolver (o professor precisa saber o
// que ajustar) e para cancelar (auditoria).
// ------------------------------------------------------------
router.post('/acompanhamentos/:id/decisao', async (req, res) => {
  const id = exigirId(req.params.id);
  const corpo = req.body || {};
  const decisao = corpo.decisao;
  if (!['publicado', 'devolvido', 'cancelado'].includes(decisao)) {
    throw new ErroHttp(400, 'Escolha uma decisão: publicar, devolver ou cancelar.');
  }
  const motivo = validarTexto(corpo.motivo, {
    nome: 'Motivo', obrigatorio: decisao !== 'publicado', maximo: 500,
  });

  await fluxo.emTransacao(async (conexao) => {
    const ac = await buscarAcompanhamento(conexao, id, true);
    await fluxo.mudarStatus(conexao, { acompanhamento: ac, usuario: req.usuario, para: decisao, observacao: motivo });
  });

  res.json(await detalhar(id));
});

// ------------------------------------------------------------
// GET /api/admin/acompanhamentos/:id/historico   (RF07)
// [ { id, dataHora, usuario, anterior, posterior, observacao } ]
// Do mais recente para o mais antigo.
// ------------------------------------------------------------
router.get('/acompanhamentos/:id/historico', async (req, res) => {
  const id = exigirId(req.params.id);
  await buscarAcompanhamento(pool, id); // 404 se não existir
  const [linhas] = await pool.query(
    `SELECT h.id, h.data_hora AS dataHora, u.nome AS usuario,
            h.estado_anterior AS anterior, h.estado_posterior AS posterior, h.observacao
       FROM historico h JOIN usuario u ON u.id = h.usuario_id
      WHERE h.acompanhamento_id = ?
      ORDER BY h.data_hora DESC, h.id DESC`,
    [id]
  );
  res.json(linhas);
});

// ------------------------------------------------------------
// PUT /api/admin/bimestres/:id   (RF04)
// Pedido: { abertura: "2026-11-01T00:00", encerramento: "2026-12-10T23:59" }
// (formato do <input type="datetime-local">, no horário da escola)
// ------------------------------------------------------------
const FORMATO_DATA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

router.put('/bimestres/:id', async (req, res) => {
  const id = exigirId(req.params.id);
  const { abertura, encerramento } = req.body || {};

  if (!FORMATO_DATA_HORA.test(abertura || '') || !FORMATO_DATA_HORA.test(encerramento || '')) {
    throw new ErroHttp(400, 'Informe a data e a hora de abertura e de encerramento.');
  }
  // Comparar os textos funciona porque o formato vai do maior para o
  // menor (ano-mês-dia hora:minuto).
  if (encerramento <= abertura) {
    throw new ErroHttp(400, 'O encerramento precisa ser depois da abertura.');
  }

  const [resultado] = await pool.query(
    'UPDATE bimestre SET data_abertura = ?, data_encerramento = ? WHERE id = ?',
    [abertura.replace('T', ' ') + ':00', encerramento.replace('T', ' ') + ':59', id]
  );
  if (resultado.affectedRows === 0) throw new ErroHttp(404, 'Bimestre não encontrado.');

  res.json({ mensagem: 'Período atualizado.' });
});

module.exports = router;
