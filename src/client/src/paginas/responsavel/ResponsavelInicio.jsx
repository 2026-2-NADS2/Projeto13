// ============================================================
// paginas/responsavel/ResponsavelInicio.jsx  (tela 1 de 4)
// Meus alunos + relatórios publicados mais recentes.
// Duas buscas independentes: cada seção tem seu próprio
// "carregando" e "erro" (uma falhar não apaga a outra).
// ============================================================
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarMeusAlunos, buscarRelatorios } from '../../servicos/servicoResponsavel';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarData, nomeBimestre } from '../../utilitarios/formatar';
import LinhaMensagem from '../../componentes/LinhaMensagem';

function ResponsavelInicio() {
  const { token } = useAutenticacao();
  const alunos = useBusca(() => buscarMeusAlunos(token), [token]);
  // Os 5 mais recentes: a API já ordena por data de publicação.
  const recentes = useBusca(() => buscarRelatorios({ pagina: 1, por_pagina: 5 }, token), [token]);

  return (
    <main>
      <h1>Painel do Responsável</h1>

      <section aria-labelledby="titulo-alunos">
        <h2 id="titulo-alunos">Meus alunos</h2>
        <ul id="lista-alunos">
          {alunos.carregando && <li>Carregando...</li>}
          {alunos.erro && <li>{alunos.erro}</li>}
          {alunos.dados?.length === 0 && <li>Nenhum aluno vinculado à sua conta. Procure a secretaria.</li>}
          {!alunos.carregando &&
            alunos.dados?.map((aluno) => (
              <li key={aluno.id}>
                <span>
                  <strong>{aluno.nome}</strong> · {aluno.turma ?? 'Sem turma'}
                </span>
                {/* ?aluno=ID: a tela de relatórios já abre filtrada */}
                <Link to={`/responsavel/relatorios?aluno=${aluno.id}`}>Ver relatórios</Link>
              </li>
            ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-recentes">
        <h2 id="titulo-recentes">Relatórios publicados recentemente</h2>
        <table>
          <caption>Últimos relatórios publicados pela escola</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Disciplina</th>
              <th scope="col">Bimestre</th>
              <th scope="col">Publicado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-recentes">
            {recentes.carregando && <LinhaMensagem colunas={5} texto="Carregando..." />}
            {recentes.erro && <LinhaMensagem colunas={5} texto={recentes.erro} erro />}
            {!recentes.carregando && !recentes.erro && recentes.dados.relatorios.length === 0 && (
              <LinhaMensagem colunas={5} texto="Ainda não há relatórios publicados." />
            )}
            {!recentes.carregando &&
              !recentes.erro &&
              recentes.dados.relatorios.map((r) => (
                <tr key={r.id}>
                  <td>{r.aluno}</td>
                  <td>{r.disciplina}</td>
                  <td>{nomeBimestre(r.bimestre)}</td>
                  <td>{formatarData(r.publicadoEm)}</td>
                  <td>
                    <Link to={`/responsavel/relatorios/${r.id}`} aria-label={`Ver relatório de ${r.disciplina} de ${r.aluno}`}>
                      Ver relatório
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p>
          <Link to="/responsavel/relatorios">Ver todos os relatórios</Link>
        </p>
      </section>
    </main>
  );
}

export default ResponsavelInicio;
