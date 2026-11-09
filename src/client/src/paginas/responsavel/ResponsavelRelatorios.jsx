// ============================================================
// paginas/responsavel/ResponsavelRelatorios.jsx  (tela 2 de 4)
// Lista de relatórios publicados, com filtros e paginação.
// É o responsavel_relatorios.js da Entrega 1 em React.
//
// Dois estados para os filtros:
//   - "campos": o que está escrito no formulário AGORA;
//   - "filtros": o que foi aplicado no último "Filtrar".
// A tabela só busca de novo quando "filtros" ou "pagina" mudam,
// e não a cada letra digitada.
// ============================================================
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import {
  buscarMeusAlunos, buscarDisciplinasDosRelatorios, buscarRelatorios,
} from '../../servicos/servicoResponsavel';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarData, formatarMedia, nomeBimestre, contar } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import LinhaMensagem from '../../componentes/LinhaMensagem';
import Paginacao from '../../componentes/Paginacao';

const COLUNAS = 7;

function ResponsavelRelatorios() {
  const { token } = useAutenticacao();
  // useSearchParams lê a parte "?aluno=1" da URL (vinda do início).
  const [parametrosUrl] = useSearchParams();

  const filtrosIniciais = {
    aluno: parametrosUrl.get('aluno') ?? '',
    ano_letivo: String(new Date().getFullYear()),
    bimestre: '',
    disciplina: '',
  };
  const filtrosLimpos = { ...filtrosIniciais, aluno: '' };

  const [campos, setCampos] = useState(filtrosIniciais);
  const [filtros, setFiltros] = useState(filtrosIniciais);
  const [pagina, setPagina] = useState(1);

  // Opções dos <select> (só os alunos e disciplinas desta família).
  const alunos = useBusca(() => buscarMeusAlunos(token), [token]);
  const disciplinas = useBusca(() => buscarDisciplinasDosRelatorios(token), [token]);

  // A tabela: busca de novo quando token, filtros ou página mudam.
  const resultado = useBusca(() => buscarRelatorios({ ...filtros, pagina }, token), [token, filtros, pagina]);

  function lidarComMudanca(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  function lidarComFiltrar(evento) {
    evento.preventDefault();
    setFiltros(campos); // aplica o que está no formulário
    setPagina(1);       // filtro novo sempre volta para a página 1
  }

  function lidarComLimpar() {
    setCampos(filtrosLimpos);
    setFiltros(filtrosLimpos);
    setPagina(1);
  }

  const dados = resultado.dados;
  const pronto = !resultado.carregando && !resultado.erro && dados;

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/responsavel' }, { texto: 'Relatórios' }]} />

      <h1>Relatórios de acompanhamento</h1>

      <section aria-labelledby="titulo-filtros">
        <h2 id="titulo-filtros">Filtrar relatórios</h2>
        {/* role="search": o CSS coloca os campos lado a lado no computador */}
        <form id="form-filtros" role="search" onSubmit={lidarComFiltrar}>
          <div>
            <label htmlFor="filtro-aluno">Aluno</label>
            <select id="filtro-aluno" name="aluno" value={campos.aluno} onChange={lidarComMudanca}>
              <option value="">Todos</option>
              {alunos.dados?.map((a) => (
                <option key={a.id} value={String(a.id)}>{a.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-ano">Ano letivo</label>
            <input type="number" id="filtro-ano" name="ano_letivo" min="2020" max="2100" value={campos.ano_letivo} onChange={lidarComMudanca} />
          </div>
          <div>
            <label htmlFor="filtro-bimestre">Bimestre</label>
            <select id="filtro-bimestre" name="bimestre" value={campos.bimestre} onChange={lidarComMudanca}>
              <option value="">Todos</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)}>{nomeBimestre(n)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-disciplina">Disciplina</label>
            <select id="filtro-disciplina" name="disciplina" value={campos.disciplina} onChange={lidarComMudanca}>
              <option value="">Todas</option>
              {disciplinas.dados?.map((nome) => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>
          </div>
          <button type="submit">Filtrar</button>
          <button type="button" onClick={lidarComLimpar}>Limpar filtros</button>
        </form>
      </section>

      <section aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">Resultados</h2>
        <p id="resumo-resultados" aria-live="polite">
          {pronto ? contar(dados.total, 'relatório encontrado', 'relatórios encontrados') : ''}
        </p>

        <table>
          <caption>Relatórios publicados pela escola</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Disciplina</th>
              <th scope="col">Bimestre</th>
              <th scope="col">Professor</th>
              <th scope="col">Média</th>
              <th scope="col">Publicado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-relatorios">
            {resultado.carregando && <LinhaMensagem colunas={COLUNAS} texto="Carregando..." />}
            {resultado.erro && <LinhaMensagem colunas={COLUNAS} texto={resultado.erro} erro />}
            {pronto && dados.relatorios.length === 0 && (
              <LinhaMensagem colunas={COLUNAS} texto="Nenhum relatório encontrado. Tente limpar os filtros." />
            )}
            {pronto &&
              dados.relatorios.map((r) => (
                <tr key={r.id}>
                  <td>{r.aluno}</td>
                  <td>{r.disciplina}</td>
                  <td>{nomeBimestre(r.bimestre)}</td>
                  <td>{r.professor}</td>
                  <td>{formatarMedia(r.media)}</td>
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

        <Paginacao
          rotulo="dos relatórios"
          pagina={pagina}
          totalPaginas={dados?.totalPaginas ?? 1}
          aoMudar={setPagina}
          desabilitado={!pronto}
        />
      </section>
    </main>
  );
}

export default ResponsavelRelatorios;
