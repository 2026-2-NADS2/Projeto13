// ============================================================
// contextos/AutenticacaoContexto.jsx
// Guarda QUEM está logado (usuario) e o TOKEN, e oferece entrar()
// e sair() para qualquer componente (capítulo 13 da apostila).
//
// Por que Context? O usuário logado é usado em muitos lugares
// distantes: cabeçalho (nome), rotas protegidas (perfil) e todas
// as páginas (token para a API). Passar isso por props em toda a
// árvore seria cansativo; o Context cria um "canal" direto.
//
// SEGURANÇA (LGPD): estes dados no navegador servem só para a
// INTERFACE (mostrar o nome, escolher o menu). Qualquer pessoa pode
// mexer no localStorage, então isto NÃO protege nada. Quem protege
// os dados é a API, conferindo o token em toda rota.
// ============================================================
import { createContext, useContext, useEffect, useState } from 'react';
import { EVENTO_SESSAO_EXPIRADA } from '../servicos/api';

const AutenticacaoContexto = createContext(null);

const CHAVE_USUARIO = 'kfka_usuario';
const CHAVE_TOKEN = 'kfka_token';

// Lê o localStorage com segurança: em alguns navegadores (modo
// privado) ele pode falhar, e um JSON quebrado não pode derrubar o app.
function lerDoArmazenamento(chave) {
  try {
    return localStorage.getItem(chave);
  } catch {
    return null;
  }
}

// O token JWT tem 3 partes separadas por ponto. A do meio é um JSON
// (em base64) com a data de validade "exp", em segundos. Ler isso
// aqui serve só para não mostrar telas com um login já vencido;
// quem decide de verdade se o token vale é o servidor.
function tokenVenceu(token) {
  try {
    const dados = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return Date.now() >= dados.exp * 1000;
  } catch {
    return true; // token ilegível = trata como vencido
  }
}

// Estado inicial: se há token válido guardado, a pessoa continua
// logada depois de um F5.
function carregarSessaoSalva() {
  const token = lerDoArmazenamento(CHAVE_TOKEN);
  const texto = lerDoArmazenamento(CHAVE_USUARIO);
  if (!token || !texto || tokenVenceu(token)) return { usuario: null, token: null };
  try {
    return { usuario: JSON.parse(texto), token };
  } catch {
    return { usuario: null, token: null };
  }
}

export function AutenticacaoProvider({ children }) {
  // useState com FUNÇÃO: o localStorage é lido só na primeira
  // renderização (inicialização preguiçosa).
  const [sessao, setSessao] = useState(carregarSessaoSalva);
  // Mensagem para a tela de login (ex.: "Sua sessão expirou").
  const [aviso, setAviso] = useState(null);

  function entrar(novoUsuario, novoToken) {
    try {
      localStorage.setItem(CHAVE_USUARIO, JSON.stringify(novoUsuario));
      localStorage.setItem(CHAVE_TOKEN, novoToken);
    } catch {
      // sem armazenamento: o login vale só até o F5
    }
    setAviso(null);
    setSessao({ usuario: novoUsuario, token: novoToken });
  }

  function sair(mensagem = null) {
    try {
      localStorage.removeItem(CHAVE_USUARIO);
      localStorage.removeItem(CHAVE_TOKEN);
    } catch {
      // nada a fazer
    }
    setAviso(mensagem);
    setSessao({ usuario: null, token: null });
  }

  // Efeito: escuta o aviso de "sessão expirada" que o api.js dispara
  // quando a API responde 401. O "return" remove o ouvinte quando o
  // componente sai da tela (limpeza do efeito, capítulo 10).
  useEffect(() => {
    function aoExpirar() {
      sair('Sua sessão expirou. Entre novamente.');
    }
    window.addEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
    return () => window.removeEventListener(EVENTO_SESSAO_EXPIRADA, aoExpirar);
  }, []);

  const valor = { usuario: sessao.usuario, token: sessao.token, aviso, entrar, sair };

  return <AutenticacaoContexto.Provider value={valor}>{children}</AutenticacaoContexto.Provider>;
}

// Hook próprio: quem consome escreve só
//   const { usuario, token, sair } = useAutenticacao();
export function useAutenticacao() {
  return useContext(AutenticacaoContexto);
}

// Página inicial de cada perfil (usada depois do login e no "/").
export const INICIO_DO_PERFIL = {
  administrador: '/admin',
  professor: '/professor',
  responsavel: '/responsavel',
};
