// ============================================================
// paginas/admin/AdminRevisao.jsx  (tela 2 do administrador)
// Todos os acompanhamentos da escola, com filtros, paginação e
// exportação para Excel (RF10 e RF11).
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarAcompanhamentos, buscarOpcoesDeFiltro, exportarAcompanhamentos } from '../../servicos/servicoAdmin';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarDataHora, formatarMedia, nomeBimestre, contar, NOMES_STATUS } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import LinhaMensagem from '../../componentes/LinhaMensagem';
import Paginacao from '../../componentes/Paginacao';

const COLUNAS = 9;
const FILTROS_PADRAO = { status: 'aguardando', turma: '', disciplina: '', professor: '', bimestre: '', aluno: '' };
const FILTROS_LIMPOS = { ...FILTROS_PADRAO, status: '' };

function AdminRevisao() {
  const { token } = useAutenticacao();
  const [campos, setCampos] = useState(FILTROS_PADRAO);
  const [filtros, setFiltros] = useState(FILTROS_PADRAO);
  const [pagina, setPagina] = useState(1);
  const [exportando, setExportando] = useState(false);
  const [erroExportar, setErroExportar] = useState(null);

  const opcoes = useBusca(() => buscarOpcoesDeFiltro(token), [token]);
  const resultado = useBusca(() => buscarAcompanhamentos({ ...filtros, pagina }, token), [token, filtros, pagina]);

  function lidarComMudanca(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  function lidarComFiltrar(evento) {
    evento.preventDefault();
    setFiltros(campos);
    setPagina(1);
  }

  function lidarComLimpar() {
    setCampos(FILTROS_LIMPOS);
    setFiltros(FILTROS_LIMPOS);
    setPagina(1);
  }

  // Exporta o que está FILTRADO na tela (não o que foi digitado e
  // ainda não aplicado).
  async function lidarComExportar() {
    setExportando(true);
    setErroExportar(null);
    try {
      await exportarAcompanhamentos(filtros, token);
    } catch (erro) {
      setErroExportar(erro.message);
    } finally {
      setExportando(false);
    }
  }

  const dados = resultado.dados;
  const pronto = !resultado.carregando && !resultado.erro && dados;

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/admin' }, { texto: 'Revisão' }]} />
      <h1>Revisão de acompanhamentos</h1>

      <section aria-labelledby="titulo-filtros">
        <h2 id="titulo-filtros">Filtrar acompanhamentos</h2>
        <form id="form-filtros" role="search" onSubmit={lidarComFiltrar}>
          <div>
            <label htmlFor="filtro-status">Status</label>
            <select id="filtro-status" name="status" value={campos.status} onChange={lidarComMudanca}>
              <option value="">Todos</option>
              <option value="aguardando">Aguardando revisão (enviados e em revisão)</option>
              {Object.entries(NOMES_STATUS).map(([valor, texto]) => (
                <option key={valor} value={valor}>{texto}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-turma">Turma</label>
            <select id="filtro-turma" name="turma" value={campos.turma} onChange={lidarComMudanca}>
              <option value="">Todas</option>
              {opcoes.dados?.turmas.map((t) => <option key={t.id} value={String(t.id)}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-disciplina">Disciplina</label>
            <select id="filtro-disciplina" name="disciplina" value={campos.disciplina} onChange={lidarComMudanca}>
              <option value="">Todas</option>
              {opcoes.dados?.disciplinas.map((d) => <option key={d.id} value={String(d.id)}>{d.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-professor">Professor(a)</label>
            <select id="filtro-professor" name="professor" value={campos.professor} onChange={lidarComMudanca}>
              <option value="">Todos</option>
              {opcoes.dados?.professores.map((p) => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-bimestre">Bimestre</label>
            <select id="filtro-bimestre" name="bimestre" value={campos.bimestre} onChange={lidarComMudanca}>
              <option value="">Todos</option>
              {[1, 2, 3, 4].map((n) => <option key={n} value={String(n)}>{nomeBimestre(n)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filtro-aluno">Nome do aluno</label>
            <input type="search" id="filtro-aluno" name="aluno" autoComplete="off" value={campos.aluno} onChange={lidarComMudanca} />
          </div>
          <button type="submit">Filtrar</button>
          <button type="button" onClick={lidarComLimpar}>Limpar filtros</button>
        </form>
      </section>

      <section aria-labelledby="titulo-resultados">
        <h2 id="titulo-resultados">Resultados</h2>
        <p id="resumo-resultados" aria-live="polite">
          {pronto ? contar(dados.total, 'acompanhamento encontrado', 'acompanhamentos encontrados') : ''}
        </p>

        <table>
          <caption>Acompanhamentos da escola</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Turma</th>
              <th scope="col">Disciplina</th>
              <th scope="col">Professor(a)</th>
              <th scope="col">Bimestre</th>
              <th scope="col">Média</th>
              <th scope="col">Status</th>
              <th scope="col">Atualizado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-acompanhamentos">
            {resultado.carregando && <LinhaMensagem colunas={COLUNAS} texto="Carregando..." />}
            {resultado.erro && <LinhaMensagem colunas={COLUNAS} texto={resultado.erro} erro />}
            {pronto && dados.acompanhamentos.length === 0 && (
              <LinhaMensagem colunas={COLUNAS} texto="Nenhum acompanhamento encontrado. Tente limpar os filtros." />
            )}
            {pronto &&
              dados.acompanhamentos.map((a) => {
                const soLeitura = a.status === 'publicado' || a.status === 'cancelado' || a.status === 'rascunho' || a.status === 'devolvido';
                return (
                  <tr key={a.id}>
                    <td>{a.aluno}</td>
                    <td>{a.turma}</td>
                    <td>{a.disciplina}</td>
                    <td>{a.professor}</td>
                    <td>{nomeBimestre(a.bimestre)}</td>
                    <td>{formatarMedia(a.media)}</td>
                    <td><EtiquetaStatus status={a.status} /></td>
                    <td>{formatarDataHora(a.atualizadoEm)}</td>
                    <td>
                      <Link to={`/admin/revisao/${a.id}`} aria-label={`${soLeitura ? 'Ver' : 'Revisar'} acompanhamento de ${a.aluno} em ${a.disciplina}`}>
                        {soLeitura ? 'Ver' : 'Revisar'}
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <Paginacao
          rotulo="dos acompanhamentos"
          pagina={pagina}
          totalPaginas={dados?.totalPaginas ?? 1}
          aoMudar={setPagina}
          desabilitado={!pronto}
        />
      </section>

      <section aria-labelledby="titulo-exportar">
        <h2 id="titulo-exportar">Exportar para Excel</h2>
        <p>Baixa a lista com os filtros aplicados acima, em formato .csv (abre no Excel). A descrição dos acompanhamentos não é exportada, para proteger os dados dos alunos.</p>
        {erroExportar && <div role="alert">{erroExportar}</div>}
        <button type="button" className="botao-secundario" onClick={lidarComExportar} disabled={exportando || !pronto}>
          {exportando ? 'Gerando arquivo...' : 'Exportar (.csv)'}
        </button>
      </section>
    </main>
  );
}

export default AdminRevisao;
