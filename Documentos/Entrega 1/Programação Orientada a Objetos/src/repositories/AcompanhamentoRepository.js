const BaseRepository = require('./BaseRepository');
const Acompanhamento = require('../models/Acompanhamento');

class AcompanhamentoRepository extends BaseRepository {
  constructor(pool) {
    super(pool, 'acompanhamento');
  }

  async criar(a, conn) {
    const [r] = await this.executor(conn).query(
      `INSERT INTO acompanhamento
         (aluno_id, turma_id, disciplina_id, professor_id, bimestre_id, descricao, media, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [a.alunoId, a.turmaId, a.disciplinaId, a.professorId, a.bimestreId, a.descricao, a.media, a.status]
    );
    a.id = r.insertId;
    return a;
  }

  async vincularTags(acompanhamentoId, tagIds, conn) {
    if (!tagIds.length) return;
    const valores = tagIds.map((tagId) => [acompanhamentoId, tagId]);
    await this.executor(conn).query(
      'INSERT INTO acomp_tag (acompanhamento_id, tag_id) VALUES ?',
      [valores]
    );
  }

  async buscarPorId(id) {
    const row = await this.buscarLinhaPorId(id);
    return row ? Acompanhamento.fromRow(row) : null;
  }

  async atualizarStatus(id, status, conn) {
    await this.executor(conn).query('UPDATE acompanhamento SET status = ? WHERE id = ?', [status, id]);
  }

  // Auditoria: usuário, data/hora, estado anterior e estado posterior
  async registrarHistorico({ acompanhamentoId, usuarioId, estadoAnterior, estadoPosterior }, conn) {
    await this.executor(conn).query(
      `INSERT INTO historico (acompanhamento_id, usuario_id, estado_anterior, estado_posterior)
       VALUES (?, ?, ?, ?)`,
      [acompanhamentoId, usuarioId, estadoAnterior, estadoPosterior]
    );
  }

  async listarHistorico(acompanhamentoId) {
    const [rows] = await this.pool.query(
      `SELECT h.id, h.estado_anterior, h.estado_posterior, h.data_hora,
              u.nome AS usuario, u.perfil
         FROM historico h
         JOIN usuario u ON u.id = h.usuario_id
        WHERE h.acompanhamento_id = ?
        ORDER BY h.data_hora, h.id`,
      [acompanhamentoId]
    );
    return rows;
  }

  // Usa a VIEW vw_relatorio_publicado do grupo: ela já filtra só o que está PUBLICADO
  async listarPublicadosDoAluno(alunoId) {
    const [rows] = await this.pool.query(
      `SELECT v.*,
              (SELECT GROUP_CONCAT(tg.nome ORDER BY tg.nome SEPARATOR ', ')
                 FROM acomp_tag atg
                 JOIN tag tg ON tg.id = atg.tag_id
                WHERE atg.acompanhamento_id = v.acompanhamento_id) AS tags
         FROM vw_relatorio_publicado v
        WHERE v.aluno_id = ?
        ORDER BY v.ano_letivo, v.bimestre_numero, v.disciplina_nome`,
      [alunoId]
    );
    return rows.map((r) => ({ ...r, media: Number(r.media) }));
  }
}

module.exports = AcompanhamentoRepository;
