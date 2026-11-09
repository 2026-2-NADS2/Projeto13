// ============================================================
// paginas/professor/ProfessorInicio.jsx  (tela inicial do professor)
// Período de digitação, minhas turmas e meus acompanhamentos.
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarBimestres } from '../../servicos/servicoConta';
import { buscarMinhasTurmas, buscarMeusAcompanhamentos } from '../../servicos/servicoProfessor';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarMedia, nomeBimestre, textoDoPeriodo, NOMES_STATUS } from '../../utilitarios/formatar';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import LinhaMensagem from '../../componentes/LinhaMensagem';

function ProfessorInicio() {
  const { token } = useAutenticacao();
  const bimestres = useBusca(() => buscarBimestres(token), [token]);
  const turmas = useBusca(() => buscarMinhasTurmas(token), [token]);

  // Filtro de status: campo do formulário x filtro aplicado.
  const [campoStatus, setCampoStatus] = useState('');
  const [status, setStatus] = useState('');
  const lista = useBusca(() => buscarMeusAcompanhamentos(status, token), [token, status]);

  function lidarComFiltrar(evento) {
    evento.preventDefault();
    setStatus(campoStatus);
  }

  return (
    <main>
      <h1>Painel do Professor</h1>

      <section aria-labelledby="titulo-periodo">
        <h2 id="titulo-periodo">Período de digitação</h2>
        <p id="periodo-digitacao">
          {bimestres.carregando ? 'Carregando...' : bimestres.erro ? bimestres.erro : textoDoPeriodo(bimestres.dados)}
        </p>
      </section>

      <section aria-labelledby="titulo-turmas">
        <h2 id="titulo-turmas">Minhas turmas</h2>
        <ul id="lista-turmas">
          {turmas.carregando && <li>Carregando...</li>}
          {turmas.erro && <li>{turmas.erro}</li>}
          {turmas.dados?.length === 0 && <li>Você ainda não foi vinculado a nenhuma turma. Procure a coordenação.</li>}
          {!turmas.carregando &&
            turmas.dados?.map((t) => (
              <li key={`${t.turmaId}-${t.disciplinaId}`}>
                <span>
                  <strong>{t.turma}</strong> · {t.disciplina} · {t.totalAlunos} aluno(s)
                </span>
                <Link to={`/professor/turmas?turma=${t.turmaId}&disciplina=${t.disciplinaId}`}>Ver alunos</Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-acompanhamentos">
        <h2 id="titulo-acompanhamentos">Meus acompanhamentos</h2>

        <form id="form-filtro-status" role="search" onSubmit={lidarComFiltrar}>
          <label htmlFor="filtro-status">Filtrar por status</label>
          <select id="filtro-status" value={campoStatus} onChange={(e) => setCampoStatus(e.target.value)}>
            <option value="">Todos</option>
            {/* Object.entries transforma { rascunho: 'Rascunho', ... }
                em [['rascunho', 'Rascunho'], ...] para o .map */}
            {Object.entries(NOMES_STATUS).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
          <button type="submit">Filtrar</button>
        </form>

        <table>
          <caption>Acompanhamentos registrados por você</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Turma</th>
              <th scope="col">Disciplina</th>
              <th scope="col">Bimestre</th>
              <th scope="col">Média</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-acompanhamentos">
            {lista.carregando && <LinhaMensagem colunas={7} texto="Carregando..." />}
            {lista.erro && <LinhaMensagem colunas={7} texto={lista.erro} erro />}
            {!lista.carregando && !lista.erro && lista.dados.length === 0 && (
              <LinhaMensagem colunas={7} texto="Nenhum acompanhamento encontrado." />
            )}
            {!lista.carregando &&
              !lista.erro &&
              lista.dados.map((a) => (
                <tr key={a.id}>
                  <td>{a.aluno}</td>
                  <td>{a.turma}</td>
                  <td>{a.disciplina}</td>
                  <td>{nomeBimestre(a.bimestre)}</td>
                  <td>{formatarMedia(a.media)}</td>
                  <td><EtiquetaStatus status={a.status} /></td>
                  <td>
                    <Link to={`/professor/acompanhamento/${a.id}`} aria-label={`Abrir acompanhamento de ${a.aluno} em ${a.disciplina}`}>
                      Abrir
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p>
          <Link to="/professor/acompanhamento">Registrar novo acompanhamento</Link>
        </p>
      </section>
    </main>
  );
}

export default ProfessorInicio;
