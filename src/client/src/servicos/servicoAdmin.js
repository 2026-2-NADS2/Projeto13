// ============================================================
// servicos/servicoAdmin.js
// Chamadas da área do Administrador (coordenação).
// ============================================================
import { requisicao, baixarArquivo, montarQuery } from './api';

// { bimestre, aguardando, alunosAtivos, professoresAtivos }
export function buscarResumo(token) {
  return requisicao('GET', '/api/admin/resumo', { token });
}

// { turmas, disciplinas, professores } -> opções dos <select>
export function buscarOpcoesDeFiltro(token) {
  return requisicao('GET', '/api/admin/filtros', { token });
}

// filtros: { status, turma, disciplina, professor, bimestre, aluno, pagina, por_pagina }
export function buscarAcompanhamentos(filtros, token) {
  return requisicao('GET', '/api/admin/acompanhamentos' + montarQuery(filtros), { token });
}

// RF11: baixa a lista filtrada em CSV (abre no Excel).
export function exportarAcompanhamentos(filtros, token) {
  return baixarArquivo('/api/admin/acompanhamentos/exportar' + montarQuery(filtros), 'acompanhamentos-kfka.csv', token);
}

export function buscarAcompanhamento(id, token) {
  return requisicao('GET', `/api/admin/acompanhamentos/${id}`, { token });
}

// dados: { descricao, media, tags, justificativa }
export function alterarConteudo(id, dados, token) {
  return requisicao('PUT', `/api/admin/acompanhamentos/${id}`, { token, corpo: dados });
}

// decisao: "publicado" | "devolvido" | "cancelado"
export function decidir(id, decisao, motivo, token) {
  return requisicao('POST', `/api/admin/acompanhamentos/${id}/decisao`, { token, corpo: { decisao, motivo } });
}

export function buscarHistorico(id, token) {
  return requisicao('GET', `/api/admin/acompanhamentos/${id}/historico`, { token });
}

// abertura/encerramento no formato "2026-11-01T00:00"
export function salvarPeriodo(idBimestre, abertura, encerramento, token) {
  return requisicao('PUT', `/api/admin/bimestres/${idBimestre}`, { token, corpo: { abertura, encerramento } });
}

// ------------------------------------------------------------
// CADASTRO DE USUÁRIOS (tela "Usuários" do admin)
// ------------------------------------------------------------

// filtros: { perfil, pagina } -> { pagina, totalPaginas, total, usuarios }
export function buscarUsuarios(filtros, token) {
  return requisicao('GET', '/api/admin/usuarios' + montarQuery(filtros), { token });
}

// [ { id, nome, turma } ] -> alunos que podem ser vinculados ao responsável
export function buscarAlunosParaVinculo(token) {
  return requisicao('GET', '/api/admin/usuarios/alunos', { token });
}

// dados: { nome, email, perfil, senha, alunoIds }
export function cadastrarUsuario(dados, token) {
  return requisicao('POST', '/api/admin/usuarios', { token, corpo: dados });
}

// ativo: true (ativar) ou false (inativar)
export function mudarAtivo(id, ativo, token) {
  return requisicao('PATCH', `/api/admin/usuarios/${id}/ativo`, { token, corpo: { ativo } });
}
