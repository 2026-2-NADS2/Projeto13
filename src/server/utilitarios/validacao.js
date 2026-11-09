// ============================================================
// utilitarios/validacao.js
// Funções pequenas que TODAS as rotas usam para conferir os dados
// que chegam do front-end. Regra de ouro: o servidor nunca confia
// no navegador. Mesmo que o React já valide o formulário, qualquer
// pessoa pode chamar a API direto (pelo Postman, por exemplo) e
// mandar o que quiser.
// ============================================================

// ------------------------------------------------------------
// ErroHttp: um erro que já sabe qual status HTTP deve virar.
//
// "class ErroHttp extends Error" cria uma classe nova que HERDA tudo
// da classe Error do JavaScript (mensagem, pilha de chamadas...) e
// acrescenta o campo "status". É herança, um conceito de POO.
//
// Como é usada nas rotas:
//   throw new ErroHttp(404, 'Relatório não encontrado.');
// O Express 5 percebe o erro lançado dentro da rota "async" e o
// entrega ao "tratador de erros" do server.js, que responde
// { "erro": "Relatório não encontrado." } com status 404.
// Assim TODAS as respostas de erro da API têm o mesmo formato.
// ------------------------------------------------------------
class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);      // chama o construtor da classe Error (guarda a mensagem)
    this.status = status; // 400, 401, 403, 404, 409...
  }
}

// ------------------------------------------------------------
// lerInteiro: converte um texto em número inteiro e confere o
// intervalo. Dados da URL (?bimestre=3) e de parâmetros (:id)
// SEMPRE chegam como texto.
// Devolve:
//   null -> valor não enviado (vazio)
//   número -> válido
//   NaN  -> inválido (quem chamou decide o erro)
// ------------------------------------------------------------
function lerInteiro(valor, minimo, maximo) {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero < minimo || numero > maximo) {
    return NaN;
  }
  return numero;
}

// Maior número que cabe numa coluna INT do MySQL.
const MAIOR_INT = 2147483647;

// ------------------------------------------------------------
// exigirId: para parâmetros obrigatórios, como o ":id" de
// /api/admin/acompanhamentos/:id. Se não for um número inteiro
// positivo, já responde 400 (em vez de mandar lixo para o banco).
// ------------------------------------------------------------
function exigirId(valor, nomeDoCampo = 'id') {
  const numero = lerInteiro(valor, 1, MAIOR_INT);
  if (numero === null || Number.isNaN(numero)) {
    throw new ErroHttp(400, `O campo "${nomeDoCampo}" é inválido.`);
  }
  return numero;
}

// ------------------------------------------------------------
// validarMedia: mesma regra do CHECK do banco (0 a 10) e do
// formulário do professor (até UMA casa decimal).
// Devolve o número ou lança ErroHttp 400.
// ------------------------------------------------------------
function validarMedia(valor) {
  // Aceita 8.5 (número) ou "8.5" (texto). Number("") é 0, então o
  // texto vazio precisa ser barrado antes.
  if (valor === '' || valor === null || valor === undefined) {
    throw new ErroHttp(400, 'Informe a média do bimestre.');
  }
  const media = Number(valor);
  if (Number.isNaN(media) || media < 0 || media > 10) {
    throw new ErroHttp(400, 'A média deve estar entre 0 e 10.');
  }
  // Multiplicar por 10 e conferir se é inteiro = "tem no máximo uma
  // casa decimal". 8.5*10 = 85 (ok); 8.55*10 = 85.5 (não).
  // Math.round evita problemas de arredondamento como 7.1*10 = 70.99999.
  if (Math.abs(media * 10 - Math.round(media * 10)) > 1e-9) {
    throw new ErroHttp(400, 'A média deve ter no máximo uma casa decimal.');
  }
  return media;
}

// ------------------------------------------------------------
// validarTexto: confere um campo de texto.
//   obrigatorio -> se true, vazio vira erro
//   maximo      -> limite de caracteres (igual ao maxlength do HTML
//                  e ao tamanho da coluna no banco)
// Devolve o texto sem espaços nas pontas, ou null (opcional vazio).
// ------------------------------------------------------------
function validarTexto(valor, { nome, obrigatorio = false, maximo }) {
  if (valor === undefined || valor === null) valor = '';
  if (typeof valor !== 'string') {
    throw new ErroHttp(400, `O campo "${nome}" é inválido.`);
  }
  const texto = valor.trim();
  if (texto === '') {
    if (obrigatorio) throw new ErroHttp(400, `Preencha o campo "${nome}".`);
    return null;
  }
  if (texto.length > maximo) {
    throw new ErroHttp(400, `O campo "${nome}" aceita no máximo ${maximo} caracteres.`);
  }
  return texto;
}

// ------------------------------------------------------------
// validarTags: a lista de tags marcadas pelo professor/admin.
// Deve ser um array de ids inteiros. Repetidos são removidos com
// "new Set" (um Set não guarda valores repetidos).
// A existência de cada tag no banco é conferida na própria rota.
// ------------------------------------------------------------
function validarTags(valor) {
  if (valor === undefined || valor === null) return [];
  if (!Array.isArray(valor) || valor.length > 20) {
    throw new ErroHttp(400, 'A lista de tags é inválida.');
  }
  const ids = valor.map((v) => lerInteiro(v, 1, MAIOR_INT));
  if (ids.some((id) => id === null || Number.isNaN(id))) {
    throw new ErroHttp(400, 'A lista de tags é inválida.');
  }
  return [...new Set(ids)];
}

// ------------------------------------------------------------
// conferirRegrasDaSenha: regras de senha por perfil (iguais às
// mostradas nas telas). Usada em DOIS lugares: na troca de senha
// (rotas/conta.js) e no cadastro de usuário pelo admin
// (rotas/usuarios.js). Por isso mora aqui, e não dentro de uma rota:
// uma regra, um lugar só.
//
// O administrador tem regra mais forte porque acessa os dados de
// TODOS os alunos: se a senha dele vazar, o estrago é maior.
// Devolve a mensagem do problema, ou null se a senha estiver ok.
// ------------------------------------------------------------
function conferirRegrasDaSenha(senha, perfil) {
  if (perfil === 'administrador') {
    if (senha.length < 12 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha) || !/[^A-Za-z0-9]/.test(senha)) {
      return 'A senha precisa ter no mínimo 12 caracteres, com letras, números e pelo menos um símbolo.';
    }
  } else if (senha.length < 8 || !/[A-Za-z]/.test(senha) || !/\d/.test(senha)) {
    return 'A senha precisa ter no mínimo 8 caracteres, com pelo menos uma letra e um número.';
  }
  if (senha.length > 72) {
    // O bcrypt só considera os primeiros 72 bytes da senha.
    return 'A senha pode ter no máximo 72 caracteres.';
  }
  return null; // null = nenhuma regra quebrada
}

// Mesmo formato de e-mail usado no front (utilitarios/validacao.js
// do client): "algo@algo.algo", sem espaços.
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Os seis estados do fluxo, iguais ao ENUM do banco.
const STATUS_VALIDOS = [
  'rascunho', 'enviado_revisao', 'em_revisao', 'publicado', 'devolvido', 'cancelado',
];

// Exporta para as outras partes do servidor usarem com require().
module.exports = {
  ErroHttp,
  lerInteiro,
  exigirId,
  validarMedia,
  validarTexto,
  validarTags,
  conferirRegrasDaSenha,
  FORMATO_EMAIL,
  STATUS_VALIDOS,
  MAIOR_INT,
};
