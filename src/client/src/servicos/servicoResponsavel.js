// ============================================================
// servicos/servicoResponsavel.js
// Chamadas da área do Pai/Responsável.
// Quem garante que só vêm os alunos DESTE responsável é a API
// (filtro pelo token). Aqui só pedimos os dados.
// ============================================================
import { requisicao, montarQuery } from './api';

// [ { id, nome, turma } ]
export function buscarMeusAlunos(token) {
  return requisicao('GET', '/api/responsavel/alunos', { token });
}

// [ "Ciências", "Matemática", ... ]
export function buscarDisciplinasDosRelatorios(token) {
  return requisicao('GET', '/api/responsavel/disciplinas', { token });
}

// filtros: { aluno, ano_letivo, bimestre, disciplina, pagina, por_pagina }
// -> { pagina, porPagina, total, totalPaginas, relatorios: [...] }
export function buscarRelatorios(filtros, token) {
  return requisicao('GET', '/api/responsavel/relatorios' + montarQuery(filtros), { token });
}

// Um relatório completo: dados, descrição, tags e ciência.
export function buscarRelatorio(id, token) {
  return requisicao('GET', `/api/responsavel/relatorios/${id}`, { token });
}

// Registra a ciência (RF12). observacao pode ser vazia.
export function registrarCiencia(id, observacao, token) {
  return requisicao('POST', `/api/responsavel/relatorios/${id}/ciencia`, { token, corpo: { observacao } });
}
