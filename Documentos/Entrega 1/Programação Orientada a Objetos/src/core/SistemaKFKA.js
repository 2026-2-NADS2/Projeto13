const ErroNegocio = require('../errors/ErroNegocio');
const Permissao = require('../models/Permissao');
const Aluno = require('../models/Aluno');
const Bimestre = require('../models/Bimestre');
const Acompanhamento = require('../models/Acompanhamento');
const { Status } = require('../models/StatusAcompanhamento');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const AlunoRepository = require('../repositories/AlunoRepository');
const BimestreRepository = require('../repositories/BimestreRepository');
const VinculoRepository = require('../repositories/VinculoRepository');
const AcompanhamentoRepository = require('../repositories/AcompanhamentoRepository');

/**
 * CLASSE PRINCIPAL DO SISTEMA (Entrega 1 - POO)
 *
 * É a "fachada" (padrão Facade) da plataforma: toda operação passa por aqui.
 * Ela orquestra as outras partes na ordem certa:
 *   1. identifica o usuário e confere a permissão do perfil;
 *   2. aplica as regras de negócio (vínculo, período do bimestre, fluxo de status);
 *   3. chama os repositórios para gravar no banco, usando transação;
 *   4. registra o histórico/auditoria.
 * As rotas HTTP não conhecem SQL nem regras: só chamam métodos desta classe.
 */
class SistemaKFKA {
  #pool;
  #usuarios;
  #alunos;
  #bimestres;
  #vinculos;
  #acompanhamentos;

  constructor(pool) {
    this.#pool = pool;
    this.#usuarios = new UsuarioRepository(pool);
    this.#alunos = new AlunoRepository(pool);
    this.#bimestres = new BimestreRepository(pool);
    this.#vinculos = new VinculoRepository(pool);
    this.#acompanhamentos = new AcompanhamentoRepository(pool);
  }

  // ---------------- Administrador ----------------

  async cadastrarAluno(usuarioId, dados) {
    await this.#exigirUsuario(usuarioId, Permissao.GERENCIAR_CADASTROS);
    const aluno = new Aluno(dados); // o construtor valida os campos
    return this.#alunos.criar(aluno);
  }

  async listarAlunos(usuarioId) {
    await this.#exigirUsuario(usuarioId, Permissao.GERENCIAR_CADASTROS);
    return this.#alunos.listar();
  }

  async definirBimestre(usuarioId, dados) {
    await this.#exigirUsuario(usuarioId, Permissao.GERENCIAR_BIMESTRES);
    const bimestre = new Bimestre(dados);
    return this.#bimestres.criar(bimestre);
  }

  // ---------------- Professor ----------------

  async registrarAcompanhamento(usuarioId, dados) {
    const professor = await this.#exigirUsuario(usuarioId, Permissao.REGISTRAR_ACOMPANHAMENTO);
    const acomp = new Acompanhamento({ ...dados, professorId: professor.id });

    const aluno = await this.#alunos.buscarPorId(acomp.alunoId);
    if (!aluno || !aluno.ativo) throw new ErroNegocio('Aluno não encontrado', 404);
    if (!aluno.possuiTurma()) throw new ErroNegocio('O aluno ainda não foi matriculado em uma turma');
    if (aluno.turmaId !== acomp.turmaId) throw new ErroNegocio('O aluno não pertence a esta turma');

    const leciona = await this.#vinculos.professorLeciona(professor.id, acomp.turmaId, acomp.disciplinaId);
    if (!leciona) throw new ErroNegocio('Professor não vinculado a esta turma/disciplina', 403);

    await this.#exigirBimestreAberto(acomp.bimestreId);

    return this.#emTransacao(async (conn) => {
      await this.#acompanhamentos.criar(acomp, conn);
      await this.#acompanhamentos.vincularTags(acomp.id, acomp.tagIds, conn);
      await this.#acompanhamentos.registrarHistorico({
        acompanhamentoId: acomp.id,
        usuarioId: professor.id,
        estadoAnterior: null,
        estadoPosterior: Status.RASCUNHO,
      }, conn);
      return acomp;
    });
  }

  async enviarParaRevisao(usuarioId, acompanhamentoId) {
    const professor = await this.#exigirUsuario(usuarioId, Permissao.REGISTRAR_ACOMPANHAMENTO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    if (acomp.professorId !== professor.id) {
      throw new ErroNegocio('Você só pode enviar seus próprios registros', 403);
    }
    await this.#exigirBimestreAberto(acomp.bimestreId);
    return this.#mudarStatus(professor, acomp, Status.ENVIADO);
  }

  // ---------------- Revisão administrativa ----------------

  async iniciarRevisao(usuarioId, acompanhamentoId) {
    const admin = await this.#exigirUsuario(usuarioId, Permissao.REVISAR_ACOMPANHAMENTO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    return this.#mudarStatus(admin, acomp, Status.EM_REVISAO);
  }

  async publicar(usuarioId, acompanhamentoId) {
    const admin = await this.#exigirUsuario(usuarioId, Permissao.REVISAR_ACOMPANHAMENTO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    return this.#mudarStatus(admin, acomp, Status.PUBLICADO);
  }

  async devolver(usuarioId, acompanhamentoId) {
    const admin = await this.#exigirUsuario(usuarioId, Permissao.REVISAR_ACOMPANHAMENTO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    return this.#mudarStatus(admin, acomp, Status.DEVOLVIDO);
  }

  async cancelar(usuarioId, acompanhamentoId) {
    const admin = await this.#exigirUsuario(usuarioId, Permissao.REVISAR_ACOMPANHAMENTO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    return this.#mudarStatus(admin, acomp, Status.CANCELADO);
  }

  async consultarHistorico(usuarioId, acompanhamentoId) {
    const usuario = await this.#exigirUsuario(usuarioId, Permissao.CONSULTAR_HISTORICO);
    const acomp = await this.#buscarAcompanhamento(acompanhamentoId);
    const ehRevisor = usuario.temPermissao(Permissao.REVISAR_ACOMPANHAMENTO);
    if (!ehRevisor && acomp.professorId !== usuario.id) {
      throw new ErroNegocio('Acesso negado a este registro', 403);
    }
    return this.#acompanhamentos.listarHistorico(acomp.id);
  }

  // ---------------- Pai/Responsável ----------------

  async consultarRelatoriosDoAluno(usuarioId, alunoId) {
    const responsavel = await this.#exigirUsuario(usuarioId, Permissao.VER_RELATORIOS_PUBLICADOS);
    const vinculado = await this.#vinculos.responsavelDoAluno(responsavel.id, alunoId);
    if (!vinculado) throw new ErroNegocio('Você não é responsável por este aluno', 403);
    return this.#acompanhamentos.listarPublicadosDoAluno(alunoId);
  }

  // ---------------- Métodos privados (orquestração interna) ----------------

  async #exigirUsuario(usuarioId, permissao) {
    const usuario = usuarioId ? await this.#usuarios.buscarPorId(usuarioId) : null;
    if (!usuario || !usuario.ativo) throw new ErroNegocio('Usuário não identificado ou inativo', 401);
    if (!usuario.temPermissao(permissao)) throw new ErroNegocio('Seu perfil não tem acesso a esta operação', 403);
    return usuario;
  }

  async #exigirBimestreAberto(bimestreId) {
    const bimestre = await this.#bimestres.buscarPorId(bimestreId);
    if (!bimestre) throw new ErroNegocio('Bimestre não encontrado', 404);
    if (!bimestre.estaAberto()) throw new ErroNegocio('Fora do período de digitação deste bimestre', 422);
    return bimestre;
  }

  async #buscarAcompanhamento(id) {
    const acomp = await this.#acompanhamentos.buscarPorId(id);
    if (!acomp) throw new ErroNegocio('Acompanhamento não encontrado', 404);
    return acomp;
  }

  // Toda mudança de status valida a transição e grava o histórico na MESMA transação
  async #mudarStatus(usuario, acomp, novoStatus) {
    const estadoAnterior = acomp.status;
    acomp.alterarStatus(novoStatus); // lança erro se a transição não for permitida

    await this.#emTransacao(async (conn) => {
      await this.#acompanhamentos.atualizarStatus(acomp.id, novoStatus, conn);
      await this.#acompanhamentos.registrarHistorico({
        acompanhamentoId: acomp.id,
        usuarioId: usuario.id,
        estadoAnterior,
        estadoPosterior: novoStatus,
      }, conn);
    });
    return acomp;
  }

  // Se qualquer passo falhar, nada é gravado (evita registros inconsistentes)
  async #emTransacao(operacao) {
    const conn = await this.#pool.getConnection();
    try {
      await conn.beginTransaction();
      const resultado = await operacao(conn);
      await conn.commit();
      return resultado;
    } catch (erro) {
      await conn.rollback();
      throw erro;
    } finally {
      conn.release();
    }
  }
}

module.exports = SistemaKFKA;
