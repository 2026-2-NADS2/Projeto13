// ============================================================
// paginas/admin/AdminInicio.jsx  (tela inicial do administrador)
// Resumo em números + o que está esperando revisão.
// ============================================================
import { Link } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarResumo, buscarAcompanhamentos } from '../../servicos/servicoAdmin';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarDataHora, formatarPrazo, nomeBimestre } from '../../utilitarios/formatar';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import LinhaMensagem from '../../componentes/LinhaMensagem';

function AdminInicio() {
  const { token } = useAutenticacao();
  const resumo = useBusca(() => buscarResumo(token), [token]);
  const fila = useBusca(() => buscarAcompanhamentos({ status: 'aguardando', pagina: 1 }, token), [token]);

  // Valor de cada cartão do resumo, com "-" enquanto carrega.
  const r = resumo.dados;
  const valor = (texto) => (resumo.carregando ? '...' : resumo.erro ? '-' : texto);
  let textoBimestre = '-';
  if (r?.bimestre) {
    textoBimestre = `${nomeBimestre(r.bimestre.numero)}`;
  } else if (r) {
    textoBimestre = 'Nenhum';
  }

  return (
    <main>
      <h1>Painel do Administrador</h1>

      <section aria-labelledby="titulo-resumo">
        <h2 id="titulo-resumo">Resumo</h2>
        {resumo.erro && <p role="status" className="erro">{resumo.erro}</p>}
        <dl>
          <div>
            <dt>Bimestre atual</dt>
            <dd id="resumo-bimestre">{valor(textoBimestre)}</dd>
          </div>
          <div>
            <dt>Aguardando revisão</dt>
            <dd id="resumo-aguardando">{valor(r?.aguardando)}</dd>
          </div>
          <div>
            <dt>Alunos ativos</dt>
            <dd id="resumo-alunos">{valor(r?.alunosAtivos)}</dd>
          </div>
          <div>
            <dt>Professores ativos</dt>
            <dd id="resumo-professores">{valor(r?.professoresAtivos)}</dd>
          </div>
        </dl>
        {r?.bimestre && (
          <p>
            {r.bimestre.aberto
              ? `Digitação do ${nomeBimestre(r.bimestre.numero)} aberta até ${formatarPrazo(r.bimestre.encerramento)}.`
              : `O ${nomeBimestre(r.bimestre.numero)} abre para digitação em ${formatarPrazo(r.bimestre.abertura)}.`}{' '}
            <Link to="/admin/periodos">Alterar períodos</Link>
          </p>
        )}
      </section>

      <section aria-labelledby="titulo-revisao">
        <h2 id="titulo-revisao">Acompanhamentos aguardando revisão</h2>
        <table>
          <caption>Registros enviados pelos professores</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Turma</th>
              <th scope="col">Disciplina</th>
              <th scope="col">Professor</th>
              <th scope="col">Bimestre</th>
              <th scope="col">Status</th>
              <th scope="col">Enviado em</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-revisao">
            {fila.carregando && <LinhaMensagem colunas={8} texto="Carregando..." />}
            {fila.erro && <LinhaMensagem colunas={8} texto={fila.erro} erro />}
            {!fila.carregando && !fila.erro && fila.dados.acompanhamentos.length === 0 && (
              <LinhaMensagem colunas={8} texto="Nada aguardando revisão. Tudo em dia!" />
            )}
            {!fila.carregando &&
              !fila.erro &&
              fila.dados.acompanhamentos.map((a) => (
                <tr key={a.id}>
                  <td>{a.aluno}</td>
                  <td>{a.turma}</td>
                  <td>{a.disciplina}</td>
                  <td>{a.professor}</td>
                  <td>{nomeBimestre(a.bimestre)}</td>
                  <td><EtiquetaStatus status={a.status} /></td>
                  <td>{formatarDataHora(a.atualizadoEm)}</td>
                  <td>
                    <Link to={`/admin/revisao/${a.id}`} aria-label={`Revisar acompanhamento de ${a.aluno} em ${a.disciplina}`}>
                      Revisar
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <p>
          <Link to="/admin/revisao">Ver todos os acompanhamentos</Link>
        </p>
      </section>
    </main>
  );
}

export default AdminInicio;
