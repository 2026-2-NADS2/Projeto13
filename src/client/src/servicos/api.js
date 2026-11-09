// ============================================================
// servicos/api.js
// A ÚNICA função que fala com a API pelo fetch. Todos os outros
// serviços (servicoConta, servicoResponsavel...) usam esta.
// Assim, o tratamento de erro, o token e a URL ficam num lugar só
// (camada de serviços, capítulo 14 da apostila).
// ============================================================

// URL da API vinda do arquivo .env.development / .env.production.
// O mesmo código funciona no computador e no Netlify: só muda a variável.
const BASE_URL = import.meta.env.VITE_API_URL;

// Nome do "aviso" disparado quando o servidor responde 401 a um
// pedido que tinha token (o login venceu). O AutenticacaoContexto
// escuta esse aviso, faz logout e manda a pessoa para o login.
export const EVENTO_SESSAO_EXPIRADA = 'kfka:sessao-expirada';

// ------------------------------------------------------------
// requisicao("GET", "/api/tags", { token })
// requisicao("POST", "/api/login", { corpo: { email, senha } })
//
// Devolve os dados da resposta (JSON). Se der erro, LANÇA um Error
// com a mensagem que a API mandou em { "erro": "..." }; quem chamou
// usa try/catch e mostra essa mensagem na tela.
// ------------------------------------------------------------
export async function requisicao(metodo, caminho, { token, corpo } = {}) {
  const cabecalhos = {};
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  // "Authorization: Bearer <token>" é como o middleware autenticar
  // (server/middlewares/autenticacao.js) sabe quem está logado.
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(BASE_URL + caminho, {
      method: metodo,
      headers: cabecalhos,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // O fetch só cai aqui quando NEM chegou ao servidor
    // (sem internet, API desligada, endereço errado).
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }

  // Lembre: o fetch NÃO lança erro em 404 ou 500. Por isso lemos a
  // resposta e conferimos resposta.ok manualmente.
  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null; // resposta sem corpo ou que não é JSON
  }

  if (!resposta.ok) {
    if (resposta.status === 401 && token) {
      // Token vencido ou inválido: avisa o resto do app.
      window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    }
    const erro = new Error(dados?.erro || 'Ocorreu um erro inesperado. Tente novamente.');
    erro.status = resposta.status; // 400, 403, 404, 409...
    throw erro;
  }
  return dados;
}

// ------------------------------------------------------------
// baixarArquivo: para a exportação em CSV. Não dá para usar um
// simples <a href> porque o pedido precisa levar o token no
// cabeçalho. Então buscamos o arquivo com fetch, criamos um
// endereço temporário para ele (URL.createObjectURL) e "clicamos"
// num link invisível para o navegador baixar.
// ------------------------------------------------------------
export async function baixarArquivo(caminho, nomeDoArquivo, token) {
  let resposta;
  try {
    resposta = await fetch(BASE_URL + caminho, { headers: { Authorization: `Bearer ${token}` } });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
  }
  if (!resposta.ok) {
    if (resposta.status === 401) window.dispatchEvent(new Event(EVENTO_SESSAO_EXPIRADA));
    const dados = await resposta.json().catch(() => null);
    throw new Error(dados?.erro || 'Não foi possível gerar o arquivo.');
  }
  const arquivo = await resposta.blob();
  const endereco = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = endereco;
  link.download = nomeDoArquivo;
  link.click();
  URL.revokeObjectURL(endereco); // libera a memória
}

// ------------------------------------------------------------
// montarQuery({ aluno: 1, bimestre: "" }) -> "?aluno=1"
// Só entram os filtros preenchidos. URLSearchParams já codifica
// acentos e espaços (ex.: "Língua Portuguesa").
// ------------------------------------------------------------
export function montarQuery(filtros) {
  const parametros = new URLSearchParams();
  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) parametros.set(chave, valor);
  });
  const texto = parametros.toString();
  return texto ? '?' + texto : '';
}
