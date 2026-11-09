// ============================================================
// servicos/servicoConta.js
// Login, dados da conta e troca de senha (as três contas usam).
// Os componentes chamam funções com nome de negócio (entrar,
// trocarSenha) e não sabem nada de URL ou cabeçalho.
// ============================================================
import { requisicao } from './api';

// POST /api/login -> { token, usuario: { id, nome, perfil } }
export function entrar(email, senha) {
  return requisicao('POST', '/api/login', { corpo: { email, senha } });
}

// GET /api/conta -> { nome, email, perfil }
export function buscarConta(token) {
  return requisicao('GET', '/api/conta', { token });
}

// PUT /api/conta/senha -> { mensagem }
export function trocarSenha(senhaAtual, senhaNova, token) {
  return requisicao('PUT', '/api/conta/senha', { token, corpo: { senhaAtual, senhaNova } });
}

// Dados de apoio (professor e admin)
export function buscarTags(token) {
  return requisicao('GET', '/api/tags', { token });
}

export function buscarBimestres(token, ano = '') {
  return requisicao('GET', '/api/bimestres' + (ano ? `?ano=${ano}` : ''), { token });
}
