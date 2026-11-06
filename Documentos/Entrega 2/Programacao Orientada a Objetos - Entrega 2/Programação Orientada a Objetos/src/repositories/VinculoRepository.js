// Consultas sobre os vínculos acadêmicos (quem leciona o quê, quem é responsável por quem)
class VinculoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async professorLeciona(professorId, turmaId, disciplinaId) {
    const [rows] = await this.pool.query(
      `SELECT 1 FROM turma_disc_prof
        WHERE turma_id = ? AND disciplina_id = ? AND professor_id = ?`,
      [turmaId, disciplinaId, professorId]
    );
    return rows.length > 0;
  }

  async responsavelDoAluno(usuarioId, alunoId) {
    const [rows] = await this.pool.query(
      'SELECT 1 FROM aluno_responsavel WHERE usuario_id = ? AND aluno_id = ?',
      [usuarioId, alunoId]
    );
    return rows.length > 0;
  }
}

module.exports = VinculoRepository;
