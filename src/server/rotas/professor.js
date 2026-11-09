// ============================================================
// rotas/professor.js
// Rotas do Professor. TODAS exigem login com perfil "professor".
//
//   GET  /api/professor/turmas                          -> minhas turmas/disciplinas
//   GET  /api/professor/turmas/:turmaId/alunos          -> alunos + situação no bimestre
//   GET  /api/professor/acompanhamentos?status=         -> meus registros
//   GET  /api/professor/acompanhamentos/:id             -> um registro
//   POST /api/professor/acompanhamentos                 -> criar (rascunho ou enviar)
//   PUT  /api/professor/acompanhamentos/:id             -> editar (rascunho ou enviar)
//
// Regras de negócio do PI aplicadas aqui:
// - O professor só registra/edita em turmas e disciplinas às quais
//   está VINCULADO (tabela turma_disc_prof).
// - Só dentro do PERÍODO de digitação do bimestre.
// - Só edita enquanto o registro está em "rascunho" ou "devolvido".
// - Um acompanhamento por aluno + disciplina + bimestre (UNIQUE).
// ============================================================

const express = require('express');
const pool = require('../db');
const { autenticar, exigirPerfil } = require('../middlewares/autenticacao');
const FluxoAcompanhamento = require('../modelos/FluxoAcompanhamento');
const {
  ErroHttp, lerInteiro, exigirId, validarMedia, validarTexto, validarTags, STATUS_VALIDOS,
} = require('../utilitarios/validacao');

const router = express.Router();
router.use(autenticar, exigirPerfil('professor'));

// Um objeto da classe do fluxo, ligado ao pool do banco.
const fluxo = new FluxoAcompanhamento(pool);

// ------------------------------------------------------------
// GET /api/professor/turmas
// [ { turmaId, turma, anoLetivo, disciplinaId, disciplina, totalAlunos } ]
// ------------------------------------------------------------
router.get('/turmas', async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT t.id AS turmaId, t.nome AS turma, t.ano_letivo AS anoLetivo,
            d.id AS disciplinaId, d.nome AS disciplina,
            (SELECT COUNT(*) FROM aluno al WHERE al.turma_id = t.id AND al.ativo = TRUE) AS totalAlunos
       FROM turma_disc_prof tdp
       JOIN turma t ON t.id = tdp.turma_id
       JOIN disciplina d ON d.id = tdp.disciplina_id
      WHERE tdp.professor_id = ?
      ORDER BY t.ano_letivo DESC, t.nome, d.nome`,
    [req.usuario.id]
  );
  res.json(linhas);
});

// ------------------------------------------------------------
// Auxiliar: confere se o professor dá aquela disciplina naquela
// turma. Devolve os dados da turma (precisamos do ano letivo).
// ------------------------------------------------------------
async function exigirVinculo(conexao, professorId, turmaId, disciplinaId) {
  const [linhas] = await conexao.query(
    `SELECT t.id, t.nome, t.ano_letivo, d.nome AS disciplina
       FROM turma_disc_prof tdp
       JOIN turma t ON t.id = tdp.turma_id
       JOIN disciplina d ON d.id = tdp.disciplina_id
      WHERE tdp.professor_id = ? AND tdp.turma_id = ? AND tdp.disciplina_id = ?`,
    [professorId, turmaId, disciplinaId]
  );
  if (linhas.length === 0) {
    throw new ErroHttp(403, 'Você não está vinculado a esta turma e disciplina.');
  }
  return linhas[0];
}

// Auxiliar: o bimestre (número 1-4) daquele ano letivo, com "aberto".
async function buscarBimestre(conexao, numero, anoLetivo) {
  const [linhas] = await conexao.query(
    `SELECT id, numero,
            DATE_FORMAT(data_abertura, '%Y-%m-%dT%H:%i') AS abertura,
            DATE_FORMAT(data_encerramento, '%Y-%m-%dT%H:%i') AS encerramento,
            (NOW() BETWEEN data_abertura AND data_encerramento) AS aberto
       FROM bimestre WHERE numero = ? AND ano_letivo = ?`,
    [numero, anoLetivo]
  );
  if (linhas.length === 0) {
    throw new ErroHttp(404, 'Este bimestre ainda não foi configurado pela coordenação.');
  }
  return { ...linhas[0], aberto: !!linhas[0].aberto };
}

// ------------------------------------------------------------
// GET /api/professor/turmas/:turmaId/alunos?disciplina=1&bimestre=3
// Lista os alunos da turma com a situação do acompanhamento daquele
// bimestre (se já existe: id, média e status).
// ------------------------------------------------------------
router.get('/turmas/:turmaId/alunos', async (req, res) => {
  const turmaId = exigirId(req.params.turmaId, 'turma');
  const disciplinaId = exigirId(req.query.disciplina, 'disciplina');
  const numero = lerInteiro(req.query.bimestre, 1, 4);
  if (numero === null || Number.isNaN(numero)) throw new ErroHttp(400, 'Bimestre inválido (1 a 4).');

  const turma = await exigirVinculo(pool, req.usuario.id, turmaId, disciplinaId);
  const bimestre = await buscarBimestre(pool, numero, turma.ano_letivo);

  // LEFT JOIN: traz TODOS os alunos da turma, mesmo os que ainda não
  // têm acompanhamento (nesse caso as colunas de "ac" vêm NULL).
  const [alunos] = await pool.query(
    `SELECT al.id AS alunoId, al.nome AS aluno,
            ac.id AS acompanhamentoId, ac.media, ac.status
       FROM aluno al
       LEFT JOIN acompanhamento ac
              ON ac.aluno_id = al.id AND ac.disciplina_id = ? AND ac.bimestre_id = ?
      WHERE al.turma_id = ? AND al.ativo = TRUE
      ORDER BY al.nome`,
    [disciplinaId, bimestre.id, turmaId]
  );

  res.json({
    turma: turma.nome,
    disciplina: turma.disciplina,
    anoLetivo: turma.ano_letivo,
    bimestre: { numero: bimestre.numero, aberto: bimestre.aberto, encerramento: bimestre.encerramento },
    alunos: alunos.map((a) => ({ ...a, media: a.media === null ? null : Number(a.media) })),
  });
});

// ------------------------------------------------------------
// GET /api/professor/acompanhamentos?status=rascunho
// Os acompanhamentos do professor logado (mais recentes primeiro).
// ------------------------------------------------------------
router.get('/acompanhamentos', async (req, res) => {
  const status = req.query.status || '';
  if (status !== '' && !STATUS_VALIDOS.includes(status)) throw new ErroHttp(400, 'Status inválido.');

  const condicoes = ['ac.professor_id = ?'];
  const valores = [req.usuario.id];
  if (status) { condicoes.push('ac.status = ?'); valores.push(status); }

  const [linhas] = await pool.query(
    `SELECT ac.id, al.nome AS aluno, t.nome AS turma, d.nome AS disciplina,
            b.numero AS bimestre, b.ano_letivo AS anoLetivo, ac.media, ac.status,
            ac.atualizado_em AS atualizadoEm
       FROM acompanhamento ac
       JOIN aluno al ON al.id = ac.aluno_id
       JOIN turma t ON t.id = ac.turma_id
       JOIN disciplina d ON d.id = ac.disciplina_id
       JOIN bimestre b ON b.id = ac.bimestre_id
      WHERE ${condicoes.join(' AND ')}
      ORDER BY ac.atualizado_em DESC, ac.id DESC
      LIMIT 200`,
    valores
  );
  res.json(linhas.map((l) => ({ ...l, media: Number(l.media) })));
});

// ------------------------------------------------------------
// Auxiliar: busca UM acompanhamento do professor logado, com tudo
// o que a tela precisa. "comTrava" = true usa SELECT ... FOR UPDATE
// dentro da transação: trava a linha até o COMMIT, para que duas
// abas salvando ao mesmo tempo não se atropelem.
// ------------------------------------------------------------
async function buscarAcompanhamento(conexao, id, professorId, comTrava = false) {
  const [linhas] = await conexao.query(
    `SELECT ac.id, ac.status, ac.descricao, ac.media,
            ac.aluno_id AS alunoId, al.nome AS aluno,
            ac.turma_id AS turmaId, t.nome AS turma,
            ac.disciplina_id AS disciplinaId, d.nome AS disciplina,
            b.numero AS bimestre, b.ano_letivo AS anoLetivo,
            DATE_FORMAT(b.data_abertura, '%Y-%m-%dT%H:%i') AS abertura,
            DATE_FORMAT(b.data_encerramento, '%Y-%m-%dT%H:%i') AS encerramento,
            (NOW() BETWEEN b.data_abertura AND b.data_encerramento) AS aberto
       FROM acompanhamento ac
       JOIN aluno al ON al.id = ac.aluno_id
       JOIN turma t ON t.id = ac.turma_id
       JOIN disciplina d ON d.id = ac.disciplina_id
       JOIN bimestre b ON b.id = ac.bimestre_id
      WHERE ac.id = ? AND ac.professor_id = ?
      ${comTrava ? 'FOR UPDATE' : ''}`,
    [id, professorId]
  );
  if (linhas.length === 0) {
    throw new ErroHttp(404, 'Acompanhamento não encontrado ou você não tem acesso a ele.');
  }
  return { ...linhas[0], aberto: !!linhas[0].aberto, media: Number(linhas[0].media) };
}

// Monta a resposta completa do detalhe (usada no GET, POST e PUT).
async function detalhar(id, professorId) {
  const ac = await buscarAcompanhamento(pool, id, professorId);

  const [tags] = await pool.query('SELECT tag_id FROM acomp_tag WHERE acompanhamento_id = ?', [id]);

  // Motivo da última devolução (o professor precisa saber o que ajustar).
  let motivoDevolucao = null;
  if (ac.status === 'devolvido') {
    const [h] = await pool.query(
      `SELECT observacao FROM historico
        WHERE acompanhamento_id = ? AND estado_posterior = 'devolvido'
        ORDER BY data_hora DESC, id DESC LIMIT 1`,
      [id]
    );
    motivoDevolucao = h[0] ? h[0].observacao : null;
  }

  // Retorno dos responsáveis (RF12), só para registros publicados.
  let ciencias = [];
  if (ac.status === 'publicado') {
    const [linhas] = await pool.query(
      `SELECT u.nome AS responsavel, c.registrada_em AS registradaEm, c.observacao
         FROM ciencia c JOIN usuario u ON u.id = c.responsavel_id
        WHERE c.acompanhamento_id = ?
        ORDER BY c.registrada_em`,
      [id]
    );
    ciencias = linhas;
  }

  const { abertura, encerramento, aberto, ...dados } = ac;
  return {
    ...dados,
    tags: tags.map((t) => t.tag_id),
    periodo: { abertura, encerramento, aberto },
    // A tela libera o formulário só quando as DUAS condições valem.
    editavel: FluxoAcompanhamento.editavelPeloProfessor(ac.status) && aberto,
    motivoDevolucao,
    ciencias,
  };
}

router.get('/acompanhamentos/:id', async (req, res) => {
  const id = exigirId(req.params.id);
  res.json(await detalhar(id, req.usuario.id));
});

// Lê e valida a parte do corpo que é igual no POST e no PUT.
function lerConteudo(corpo) {
  const acao = corpo.acao;
  if (acao !== 'rascunho' && acao !== 'enviar') {
    throw new ErroHttp(400, 'Ação inválida. Use "rascunho" ou "enviar".');
  }
  return {
    acao,
    descricao: validarTexto(corpo.descricao, { nome: 'Descrição', obrigatorio: true, maximo: 2000 }),
    media: validarMedia(corpo.media),
    tags: validarTags(corpo.tags),
  };
}

// ------------------------------------------------------------
// POST /api/professor/acompanhamentos
// Pedido: { turmaId, disciplinaId, alunoId, bimestre, descricao,
//           media, tags: [1, 3], acao: "rascunho" | "enviar" }
// Sucesso: 201 com o acompanhamento criado (mesmo formato do GET).
// ------------------------------------------------------------
router.post('/acompanhamentos', async (req, res) => {
  const corpo = req.body || {};
  const turmaId = exigirId(corpo.turmaId, 'turma');
  const disciplinaId = exigirId(corpo.disciplinaId, 'disciplina');
  const alunoId = exigirId(corpo.alunoId, 'aluno');
  const numero = lerInteiro(corpo.bimestre, 1, 4);
  if (numero === null || Number.isNaN(numero)) throw new ErroHttp(400, 'Bimestre inválido (1 a 4).');
  const { acao, descricao, media, tags } = lerConteudo(corpo);

  const novoId = await fluxo.emTransacao(async (conexao) => {
    const turma = await exigirVinculo(conexao, req.usuario.id, turmaId, disciplinaId);

    const [alunos] = await conexao.query(
      'SELECT id FROM aluno WHERE id = ? AND turma_id = ? AND ativo = TRUE',
      [alunoId, turmaId]
    );
    if (alunos.length === 0) throw new ErroHttp(400, 'Este aluno não pertence à turma escolhida.');

    const bimestre = await buscarBimestre(conexao, numero, turma.ano_letivo);
    if (!bimestre.aberto) {
      throw new ErroHttp(409, `O período de digitação do ${numero}º bimestre está fechado.`);
    }

    const status = acao === 'enviar' ? 'enviado_revisao' : 'rascunho';
    let resultado;
    try {
      [resultado] = await conexao.query(
        `INSERT INTO acompanhamento
           (aluno_id, turma_id, disciplina_id, professor_id, bimestre_id, descricao, media, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [alunoId, turmaId, disciplinaId, req.usuario.id, bimestre.id, descricao, media, status]
      );
    } catch (erro) {
      if (erro.code === 'ER_DUP_ENTRY') {
        throw new ErroHttp(409, 'Já existe um acompanhamento deste aluno nesta disciplina e bimestre. Abra-o pela tela "Minhas turmas".');
      }
      throw erro;
    }

    await fluxo.substituirTags(conexao, resultado.insertId, tags);
    // Primeira linha do histórico: "nasceu" neste status (anterior = NULL).
    await fluxo.registrarHistorico(conexao, {
      acompanhamentoId: resultado.insertId, usuarioId: req.usuario.id, de: null, para: status,
    });
    return resultado.insertId;
  });

  res.status(201).json(await detalhar(novoId, req.usuario.id));
});

// ------------------------------------------------------------
// PUT /api/professor/acompanhamentos/:id
// Pedido: { descricao, media, tags, acao: "rascunho" | "enviar" }
// Turma, aluno e bimestre NÃO mudam depois de criado.
// ------------------------------------------------------------
router.put('/acompanhamentos/:id', async (req, res) => {
  const id = exigirId(req.params.id);
  const { acao, descricao, media, tags } = lerConteudo(req.body || {});

  await fluxo.emTransacao(async (conexao) => {
    const ac = await buscarAcompanhamento(conexao, id, req.usuario.id, true);

    // Confere o vínculo de novo: o admin pode ter tirado o professor da turma.
    await exigirVinculo(conexao, req.usuario.id, ac.turmaId, ac.disciplinaId);

    if (!FluxoAcompanhamento.editavelPeloProfessor(ac.status)) {
      throw new ErroHttp(409, 'Este acompanhamento já foi enviado e não pode mais ser editado.');
    }
    if (!ac.aberto) {
      throw new ErroHttp(409, `O período de digitação do ${ac.bimestre}º bimestre está fechado.`);
    }

    await conexao.query('UPDATE acompanhamento SET descricao = ?, media = ? WHERE id = ?', [descricao, media, id]);
    await fluxo.substituirTags(conexao, id, tags);

    // "enviar" vai para revisão; "rascunho" mantém o status atual
    // (um devolvido continua devolvido até ser reenviado).
    const para = acao === 'enviar' ? 'enviado_revisao' : ac.status;
    await fluxo.mudarStatus(conexao, { acompanhamento: ac, usuario: req.usuario, para });
  });

  res.json(await detalhar(id, req.usuario.id));
});

module.exports = router;
