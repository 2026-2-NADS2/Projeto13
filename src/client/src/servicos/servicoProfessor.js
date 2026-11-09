// ============================================================
// servicos/servicoProfessor.js
// Chamadas da área do Professor.
// ============================================================
import { requisicao, montarQuery } from './api';

// [ { turmaId, turma, anoLetivo, disciplinaId, disciplina, totalAlunos } ]
export function buscarMinhasTurmas(token) {
  return requisicao('GET', '/api/professor/turmas', { token });
}

// { turma, disciplina, anoLetivo, bimestre: {...}, alunos: [...] }
export function buscarAlunosDaTurma(turmaId, disciplinaId, bimestre, token) {
  const query = montarQuery({ disciplina: disciplinaId, bimestre });
  return requisicao('GET', `/api/professor/turmas/${turmaId}/alunos${query}`, { token });
}

// status vazio = todos
export function buscarMeusAcompanhamentos(status, token) {
  return requisicao('GET', '/api/professor/acompanhamentos' + montarQuery({ status }), { token });
}

export function buscarAcompanhamento(id, token) {
  return requisicao('GET', `/api/professor/acompanhamentos/${id}`, { token });
}

// dados: { turmaId, disciplinaId, alunoId, bimestre, descricao, media, tags, acao }
export function criarAcompanhamento(dados, token) {
  return requisicao('POST', '/api/professor/acompanhamentos', { token, corpo: dados });
}

// dados: { descricao, media, tags, acao }
export function atualizarAcompanhamento(id, dados, token) {
  return requisicao('PUT', `/api/professor/acompanhamentos/${id}`, { token, corpo: dados });
}
