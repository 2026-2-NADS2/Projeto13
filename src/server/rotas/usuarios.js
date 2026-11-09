// ============================================================
// rotas/usuarios.js
// CADASTRO DE USUÁRIOS (E2: "autenticação de usuário - cadastro/
// login"; PI: RF02 e módulo Administrador, item "cadastrar, editar,
// ativar e inativar pais/responsáveis e professores").
//
//   GET   /api/admin/usuarios            -> lista paginada (filtro por perfil)
//   GET   /api/admin/usuarios/alunos     -> alunos ativos (para vincular ao responsável)
//   POST  /api/admin/usuarios            -> cadastra um usuário
//   PATCH /api/admin/usuarios/:id/ativo  -> ativa ou inativa
//
// POR QUE O CADASTRO É FEITO PELO ADMIN, E NÃO ABERTO A QUALQUER UM?
// Na Aula 11, o exemplo tem um "POST /auth/registro" público: qualquer
// visitante cria a própria conta. No KFKA isso seria um problema:
//   1. Regra de negócio (RF02): quem cadastra responsáveis e
//      professores é o Administrador da escola.
//   2. LGPD: o sistema guarda dados de CRIANÇAS. Se o cadastro fosse
//      aberto, um estranho poderia criar uma conta de "responsável".
//      O cadastro sozinho não daria acesso a nenhum aluno (o vínculo
//      aluno_responsavel é que libera os relatórios), mas o princípio
//      do menor privilégio diz: ninguém entra sem a escola autorizar.
// Por isso a técnica é a MESMA da aula (bcrypt.hash, 409 para e-mail
// repetido, nunca devolver a senha), mas a rota é protegida e só o
// administrador pode usá-la.
// ============================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { autenticar, exigirPerfil } = require('../middlewares/autenticacao');
const {
  ErroHttp, lerInteiro, exigirId, validarTexto, conferirRegrasDaSenha, FORMATO_EMAIL, MAIOR_INT,
} = require('../utilitarios/validacao');

const router = express.Router();

// Todas as rotas deste arquivo: precisa estar logado (401) e ser
// administrador (403). Como é um router.use no topo, é impossível
// esquecer a proteção em alguma rota nova.
router.use(autenticar, exigirPerfil('administrador'));

// Os três perfis, iguais ao ENUM da coluna usuario.perfil.
const PERFIS = ['administrador', 'professor', 'responsavel'];

// ------------------------------------------------------------
// GET /api/admin/usuarios?perfil=&pagina=
// { pagina, porPagina, total, totalPaginas,
//   usuarios: [ { id, nome, email, perfil, ativo, criadoEm, alunos } ] }
//
// "alunos" só vem preenchido para responsáveis: os nomes dos alunos
// vinculados, separados por vírgula (GROUP_CONCAT junta várias
// linhas da tabela aluno_responsavel num texto só).
// Minimização (LGPD): a lista NÃO traz senha_hash, data de
// nascimento nem nada além do necessário para a tela.
// ------------------------------------------------------------
router.get('/', async (req, res) => {
  const perfil = req.query.perfil || '';
  if (perfil !== '' && !PERFIS.includes(perfil)) {
    throw new ErroHttp(400, 'Perfil inválido.');
  }
  const pagina = lerInteiro(req.query.pagina, 1, 100000) ?? 1;
  if (Number.isNaN(pagina)) throw new ErroHttp(400, 'Página inválida.');
  const porPagina = 10;

  // O filtro de perfil é opcional. Mesmo assim o valor vai como "?"
  // (parâmetro do mysql2), nunca colado no texto do SQL.
  const where = perfil ? 'WHERE u.perfil = ?' : '';
  const valores = perfil ? [perfil] : [];

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM usuario u ${where}`, valores);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  const [linhas] = await pool.query(
    `SELECT u.id, u.nome, u.email, u.perfil, u.ativo, u.criado_em AS criadoEm,
            GROUP_CONCAT(a.nome ORDER BY a.nome SEPARATOR ', ') AS alunos
       FROM usuario u
       LEFT JOIN aluno_responsavel ar ON ar.usuario_id = u.id
       LEFT JOIN aluno a ON a.id = ar.aluno_id
       ${where}
      GROUP BY u.id
      ORDER BY u.nome
      LIMIT ? OFFSET ?`,
    [...valores, porPagina, (pagina - 1) * porPagina]
  );

  res.json({
    pagina,
    porPagina,
    total,
    totalPaginas,
    // O MySQL devolve BOOLEAN como 0/1; o "=== 1" vira true/false.
    usuarios: linhas.map((u) => ({ ...u, ativo: u.ativo === 1 })),
  });
});

// ------------------------------------------------------------
// GET /api/admin/usuarios/alunos
// [ { id, nome, turma } ] -> opções da lista "Alunos vinculados"
// do formulário, usada quando o perfil escolhido é "responsavel".
// ATENÇÃO: esta rota precisa vir ANTES de qualquer rota "/:id",
// senão o Express acharia que "alunos" é um id.
// ------------------------------------------------------------
router.get('/alunos', async (req, res) => {
  const [linhas] = await pool.query(
    `SELECT a.id, a.nome, t.nome AS turma
       FROM aluno a
       LEFT JOIN turma t ON t.id = a.turma_id
      WHERE a.ativo = TRUE
      ORDER BY a.nome`
  );
  res.json(linhas);
});

// ------------------------------------------------------------
// POST /api/admin/usuarios
// Pedido : { nome, email, perfil, senha, alunoIds: [1, 2] }
//          (alunoIds só para perfil "responsavel"; opcional)
// Sucesso: 201 { id, nome, email, perfil, ativo }
// Erros  : 400 (dado inválido), 409 (e-mail já cadastrado)
//
// A senha informada aqui é a SENHA INICIAL: o admin a entrega à
// pessoa, que depois troca em "Minha conta".
// ------------------------------------------------------------
router.post('/', async (req, res) => {
  const corpo = req.body || {};

  // 1) Validação de cada campo (o servidor nunca confia no front).
  const nome = validarTexto(corpo.nome, { nome: 'Nome', obrigatorio: true, maximo: 150 });
  const emailDigitado = validarTexto(corpo.email, { nome: 'E-mail', obrigatorio: true, maximo: 150 });
  // E-mail sempre em minúsculas: "Ana@Escola.com" e "ana@escola.com"
  // são o mesmo endereço e não podem virar duas contas.
  const email = emailDigitado.toLowerCase();
  if (!FORMATO_EMAIL.test(email)) {
    throw new ErroHttp(400, 'Digite um e-mail válido, como nome@exemplo.com.');
  }

  const perfil = corpo.perfil;
  if (!PERFIS.includes(perfil)) {
    throw new ErroHttp(400, 'Escolha o perfil: administrador, professor ou responsável.');
  }

  if (typeof corpo.senha !== 'string' || corpo.senha === '') {
    throw new ErroHttp(400, 'Informe a senha inicial.');
  }
  const problemaNaSenha = conferirRegrasDaSenha(corpo.senha, perfil);
  if (problemaNaSenha) throw new ErroHttp(400, problemaNaSenha);

  // Vínculos com alunos: só fazem sentido para responsável.
  let alunoIds = [];
  if (perfil === 'responsavel' && corpo.alunoIds !== undefined && corpo.alunoIds !== null) {
    if (!Array.isArray(corpo.alunoIds) || corpo.alunoIds.length > 20) {
      throw new ErroHttp(400, 'A lista de alunos é inválida.');
    }
    const ids = corpo.alunoIds.map((v) => lerInteiro(v, 1, MAIOR_INT));
    if (ids.some((id) => id === null || Number.isNaN(id))) {
      throw new ErroHttp(400, 'A lista de alunos é inválida.');
    }
    alunoIds = [...new Set(ids)]; // tira repetidos
  }

  // 2) Hash da senha (Aula 11). O "10" é o custo: quantas rodadas o
  // bcrypt faz. Mais rodadas = mais lento para um atacante testar
  // milhões de senhas. A senha em texto puro nunca vai para o banco.
  const senhaHash = await bcrypt.hash(corpo.senha, 10);

  // 3) Grava usuário + vínculos numa TRANSAÇÃO: ou entra tudo, ou
  // nada. Sem isso, um aluno inexistente na lista deixaria o usuário
  // criado mas sem vínculo (registro "pela metade").
  const conexao = await pool.getConnection();
  let novoId;
  try {
    await conexao.beginTransaction();

    if (alunoIds.length > 0) {
      const [encontrados] = await conexao.query(
        'SELECT id FROM aluno WHERE id IN (?) AND ativo = TRUE',
        [alunoIds]
      );
      if (encontrados.length !== alunoIds.length) {
        throw new ErroHttp(400, 'Algum dos alunos escolhidos não existe ou está inativo.');
      }
    }

    let resultado;
    try {
      [resultado] = await conexao.query(
        'INSERT INTO usuario (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)',
        [nome, email, senhaHash, perfil]
      );
    } catch (erro) {
      // A coluna email é UNIQUE no schema.sql. Se já existir, o MySQL
      // recusa com ER_DUP_ENTRY, e nós traduzimos para 409 (Conflito),
      // igual à Aula 11.
      if (erro.code === 'ER_DUP_ENTRY') {
        throw new ErroHttp(409, 'Já existe um usuário com este e-mail.');
      }
      throw erro;
    }
    novoId = resultado.insertId;

    // Um INSERT com várias linhas de uma vez: [[aluno, usuario], ...]
    if (alunoIds.length > 0) {
      await conexao.query(
        'INSERT INTO aluno_responsavel (aluno_id, usuario_id) VALUES ?',
        [alunoIds.map((alunoId) => [alunoId, novoId])]
      );
    }

    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro; // o tratador de erros do server.js responde
  } finally {
    conexao.release(); // devolve a conexão ao pool, dê certo ou não
  }

  // 201 = "Created" (criado). NUNCA devolvemos a senha nem o hash.
  res.status(201).json({ id: novoId, nome, email, perfil, ativo: true });
});

// ------------------------------------------------------------
// PATCH /api/admin/usuarios/:id/ativo
// Pedido : { ativo: true | false }
// Sucesso: 200 { id, ativo }
//
// Inativar em vez de apagar: o usuário pode ter acompanhamentos e
// linhas no histórico (auditoria, RF07). Apagar quebraria essas
// referências. Inativo, ele simplesmente não consegue mais entrar
// (o login filtra "ativo = TRUE").
// Observação: um token já emitido continua valendo até expirar
// (JWT_EXPIRA, 2h). Para cortar na hora, seria preciso consultar o
// banco a cada pedido; para o MVP, a expiração curta resolve.
// ------------------------------------------------------------
router.patch('/:id/ativo', async (req, res) => {
  const id = exigirId(req.params.id);
  const { ativo } = req.body || {};
  if (typeof ativo !== 'boolean') {
    throw new ErroHttp(400, 'Informe se o usuário fica ativo (true) ou inativo (false).');
  }

  // O admin não pode se trancar fora do sistema sem querer.
  if (id === req.usuario.id && ativo === false) {
    throw new ErroHttp(400, 'Você não pode inativar a sua própria conta.');
  }

  const [resultado] = await pool.query('UPDATE usuario SET ativo = ? WHERE id = ?', [ativo, id]);
  if (resultado.affectedRows === 0) throw new ErroHttp(404, 'Usuário não encontrado.');

  res.json({ id, ativo });
});

module.exports = router;
