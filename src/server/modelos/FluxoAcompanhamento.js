// ============================================================
// modelos/FluxoAcompanhamento.js
// A CLASSE que representa a regra de negócio mais importante do PI:
// o fluxo de estados do acompanhamento.
//
//   Rascunho -> Enviado para revisão -> Em revisão -> Publicado
//   (alternativas: Devolvido para ajustes / Cancelado)
//
// Por que uma classe? (POO)
// - ENCAPSULAMENTO: as regras de "quem pode mudar de qual estado
//   para qual" ficam num lugar só. As rotas do professor e do admin
//   não repetem essas regras: perguntam à classe.
// - Um método que muda o status SEMPRE grava o histórico junto.
//   Assim é impossível esquecer a auditoria (RF07) em alguma rota.
// - TRANSAÇÃO: mudar o status + gravar histórico + trocar as tags
//   acontece "tudo ou nada". Se uma parte falhar, o banco desfaz
//   as outras (requisito de integridade do PI).
// ============================================================

const { ErroHttp } = require('../utilitarios/validacao');

class FluxoAcompanhamento {
  // ----------------------------------------------------------
  // Tabela de transições permitidas, por perfil.
  // Lê-se: o PROFESSOR, num registro em "rascunho", pode deixá-lo em
  // "rascunho" (salvar de novo) ou mandá-lo para "enviado_revisao".
  // "static" = pertence à classe, não a cada objeto. É uma regra
  // única do sistema, igual para todos.
  // ----------------------------------------------------------
  static TRANSICOES = {
    professor: {
      rascunho: ['rascunho', 'enviado_revisao'],
      devolvido: ['devolvido', 'enviado_revisao'], // corrige e reenvia
    },
    administrador: {
      enviado_revisao: ['em_revisao', 'publicado', 'devolvido', 'cancelado'],
      em_revisao: ['em_revisao', 'publicado', 'devolvido', 'cancelado'],
      publicado: ['cancelado'], // retirar do ar um relatório publicado por engano
    },
  };

  // O construtor recebe o pool de conexões do MySQL (db.js).
  // Cada rota cria o seu objeto com: new FluxoAcompanhamento(pool)
  constructor(pool) {
    this.pool = pool;
  }

  // ----------------------------------------------------------
  // podeMudar('professor', 'rascunho', 'enviado_revisao') -> true
  // O "?." (encadeamento opcional) evita erro quando o perfil ou o
  // estado não existe na tabela: devolve undefined, e "?? []" troca
  // por lista vazia.
  // ----------------------------------------------------------
  static podeMudar(perfil, de, para) {
    const permitidos = FluxoAcompanhamento.TRANSICOES[perfil]?.[de] ?? [];
    return permitidos.includes(para);
  }

  // Estados em que o professor ainda pode editar o texto.
  static editavelPeloProfessor(status) {
    return status === 'rascunho' || status === 'devolvido';
  }

  // Estados em que o admin ainda pode alterar o conteúdo.
  static editavelPeloAdmin(status) {
    return status === 'enviado_revisao' || status === 'em_revisao';
  }

  // ----------------------------------------------------------
  // emTransacao(funcao): pega UMA conexão do pool, abre a transação,
  // roda a função que recebeu e:
  //   - deu certo -> COMMIT (grava tudo);
  //   - deu erro  -> ROLLBACK (desfaz tudo) e repassa o erro.
  // O "finally" devolve a conexão ao pool em qualquer caso; sem
  // isso, as conexões acabariam e a API travaria.
  // ----------------------------------------------------------
  async emTransacao(funcao) {
    const conexao = await this.pool.getConnection();
    try {
      await conexao.beginTransaction();
      const resultado = await funcao(conexao);
      await conexao.commit();
      return resultado;
    } catch (erro) {
      await conexao.rollback();
      throw erro;
    } finally {
      conexao.release();
    }
  }

  // ----------------------------------------------------------
  // registrarHistorico: grava uma linha na tabela historico (RF07).
  // Guarda: quem (usuario_id), quando (data_hora automática), o
  // estado anterior, o novo estado e o motivo/justificativa.
  // ----------------------------------------------------------
  async registrarHistorico(conexao, { acompanhamentoId, usuarioId, de, para, observacao = null }) {
    await conexao.query(
      `INSERT INTO historico
         (acompanhamento_id, usuario_id, estado_anterior, estado_posterior, observacao)
       VALUES (?, ?, ?, ?, ?)`,
      [acompanhamentoId, usuarioId, de, para, observacao]
    );
  }

  // ----------------------------------------------------------
  // substituirTags: apaga as tags antigas do acompanhamento e grava
  // as novas. Antes, confere se todas as tags existem (senão a FK do
  // banco daria um erro técnico pouco claro).
  // ----------------------------------------------------------
  async substituirTags(conexao, acompanhamentoId, tags) {
    if (tags.length > 0) {
      const [existentes] = await conexao.query('SELECT id FROM tag WHERE id IN (?)', [tags]);
      if (existentes.length !== tags.length) {
        throw new ErroHttp(400, 'Uma ou mais tags selecionadas não existem.');
      }
    }
    await conexao.query('DELETE FROM acomp_tag WHERE acompanhamento_id = ?', [acompanhamentoId]);
    if (tags.length > 0) {
      // "VALUES ?" com uma lista de listas insere várias linhas de uma
      // vez: [[10, 1], [10, 3]] -> (10, 1), (10, 3).
      await conexao.query(
        'INSERT INTO acomp_tag (acompanhamento_id, tag_id) VALUES ?',
        [tags.map((tagId) => [acompanhamentoId, tagId])]
      );
    }
  }

  // ----------------------------------------------------------
  // mudarStatus: o ÚNICO jeito de trocar o status de um registro.
  // Confere a regra de transição, atualiza a linha e grava o
  // histórico. Se o status não mudou (ex.: salvar rascunho de novo),
  // não grava histórico, porque não houve mudança de estado.
  //
  //   acompanhamento -> a linha atual do banco ({ id, status })
  //   usuario        -> req.usuario ({ id, perfil })
  //   para           -> novo status
  //   observacao     -> motivo/justificativa (opcional)
  // ----------------------------------------------------------
  async mudarStatus(conexao, { acompanhamento, usuario, para, observacao = null }) {
    const de = acompanhamento.status;
    if (!FluxoAcompanhamento.podeMudar(usuario.perfil, de, para)) {
      // 409 = "conflito": o pedido não combina com o estado atual.
      throw new ErroHttp(409, 'Esta ação não é permitida no status atual do acompanhamento.');
    }
    if (de === para && !observacao) return;

    await conexao.query('UPDATE acompanhamento SET status = ? WHERE id = ?', [para, acompanhamento.id]);
    await this.registrarHistorico(conexao, {
      acompanhamentoId: acompanhamento.id,
      usuarioId: usuario.id,
      de,
      para,
      observacao,
    });
  }
}

module.exports = FluxoAcompanhamento;
