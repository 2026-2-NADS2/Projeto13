// ============================================================
// paginas/professor/ProfessorTurmas.jsx  (tela 2 do professor)
// Escolhe turma + disciplina + bimestre e vê a situação de cada
// aluno: sem registro (link "Registrar") ou com registro ("Abrir").
// Pode abrir já escolhida pela URL: ?turma=1&disciplina=1
// ============================================================
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarBimestres } from '../../servicos/servicoConta';
import { buscarMinhasTurmas, buscarAlunosDaTurma } from '../../servicos/servicoProfessor';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarMedia, nomeBimestre } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import LinhaMensagem from '../../componentes/LinhaMensagem';

function ProfessorTurmas() {
  const { token } = useAutenticacao();
  const [parametrosUrl] = useSearchParams();
  const turmaUrl = parametrosUrl.get('turma');
  const disciplinaUrl = parametrosUrl.get('disciplina');
  // A turma e a disciplina viram uma "chave" só: "1-3" = turma 1, disciplina 3.
  const chaveUrl = turmaUrl && disciplinaUrl ? `${turmaUrl}-${disciplinaUrl}` : '';

  const turmas = useBusca(() => buscarMinhasTurmas(token), [token]);
  const bimestres = useBusca(() => buscarBimestres(token), [token]);
  // Bimestre sugerido: o que está aberto (ou o 1º, se nenhum estiver).
  const bimestrePadrao = String(bimestres.dados?.find((b) => b.aberto)?.numero ?? 1);

  const [campos, setCampos] = useState({ turma: chaveUrl, bimestre: '' });
  const [erroTurma, setErroTurma] = useState(null);
  // A seleção APLICADA (depois de "Ver alunos"). Se veio pela URL,
  // já começa aplicada.
  const [selecao, setSelecao] = useState(chaveUrl ? { chave: chaveUrl, bimestre: '' } : null);

  // Enquanto os bimestres não chegam, ainda não sabemos o padrão.
  const bimestreAplicado = selecao ? selecao.bimestre || (bimestres.dados ? bimestrePadrao : '') : '';

  const alunos = useBusca(() => {
    if (!selecao || !bimestreAplicado) return Promise.resolve(null); // nada escolhido ainda
    const [turmaId, disciplinaId] = selecao.chave.split('-');
    return buscarAlunosDaTurma(turmaId, disciplinaId, bimestreAplicado, token);
  }, [token, selecao, bimestreAplicado]);

  function lidarComEnvio(evento) {
    evento.preventDefault();
    if (!campos.turma) {
      setErroTurma('Escolha uma turma.');
      return;
    }
    setErroTurma(null);
    setSelecao({ chave: campos.turma, bimestre: campos.bimestre || bimestrePadrao });
  }

  const dados = alunos.dados;
  const pronto = selecao && !alunos.carregando && !alunos.erro && dados;
  const [turmaSel, disciplinaSel] = selecao ? selecao.chave.split('-') : [];

  let resumo = 'Escolha uma turma para ver os alunos.';
  if (selecao && alunos.carregando) resumo = 'Carregando...';
  if (pronto) {
    const registrados = dados.alunos.filter((a) => a.acompanhamentoId).length;
    resumo = `${dados.turma} – ${dados.disciplina} · ${nomeBimestre(dados.bimestre.numero)} · ${registrados} de ${dados.alunos.length} registrados`;
    if (!dados.bimestre.aberto) resumo += ' · período de digitação fechado';
  }

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/professor' }, { texto: 'Minhas turmas' }]} />
      <h1>Minhas turmas</h1>

      <section aria-labelledby="titulo-escolha">
        <h2 id="titulo-escolha">Escolha a turma</h2>
        <form id="form-turma" role="search" noValidate onSubmit={lidarComEnvio}>
          <div>
            <label htmlFor="selecao-turma">Turma e disciplina</label>
            <select
              id="selecao-turma"
              value={campos.turma}
              onChange={(e) => setCampos({ ...campos, turma: e.target.value })}
              aria-invalid={erroTurma ? 'true' : undefined}
              aria-describedby="erro-turma"
            >
              <option value="">{turmas.carregando ? 'Carregando...' : 'Selecione uma turma'}</option>
              {turmas.dados?.map((t) => (
                <option key={`${t.turmaId}-${t.disciplinaId}`} value={`${t.turmaId}-${t.disciplinaId}`}>
                  {t.turma} – {t.disciplina}
                </option>
              ))}
            </select>
            <span id="erro-turma">{erroTurma}</span>
          </div>
          <div>
            <label htmlFor="selecao-bimestre">Bimestre</label>
            <select
              id="selecao-bimestre"
              value={campos.bimestre || bimestrePadrao}
              onChange={(e) => setCampos({ ...campos, bimestre: e.target.value })}
            >
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={String(n)}>{nomeBimestre(n)}</option>
              ))}
            </select>
          </div>
          <button type="submit">Ver alunos</button>
        </form>
      </section>

      <section aria-labelledby="titulo-alunos">
        <h2 id="titulo-alunos">Alunos da turma</h2>
        <p id="resumo-turma" aria-live="polite">{resumo}</p>
        <table>
          <caption>Alunos e situação do acompanhamento no bimestre</caption>
          <thead>
            <tr>
              <th scope="col">Aluno</th>
              <th scope="col">Média</th>
              <th scope="col">Status</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody id="tabela-alunos">
            {!selecao && <LinhaMensagem colunas={4} texto="Nenhuma turma selecionada." />}
            {selecao && alunos.carregando && <LinhaMensagem colunas={4} texto="Carregando..." />}
            {selecao && alunos.erro && <LinhaMensagem colunas={4} texto={alunos.erro} erro />}
            {pronto && dados.alunos.length === 0 && <LinhaMensagem colunas={4} texto="Esta turma não tem alunos ativos." />}
            {pronto &&
              dados.alunos.map((a) => (
                <tr key={a.alunoId}>
                  <td>{a.aluno}</td>
                  <td>{a.media === null ? '-' : formatarMedia(a.media)}</td>
                  <td>{a.status ? <EtiquetaStatus status={a.status} /> : 'Sem registro'}</td>
                  <td>
                    {a.acompanhamentoId ? (
                      <Link to={`/professor/acompanhamento/${a.acompanhamentoId}`} aria-label={`Abrir acompanhamento de ${a.aluno}`}>
                        Abrir
                      </Link>
                    ) : dados.bimestre.aberto ? (
                      <Link
                        to={`/professor/acompanhamento?turma=${turmaSel}&disciplina=${disciplinaSel}&aluno=${a.alunoId}&bimestre=${dados.bimestre.numero}`}
                        aria-label={`Registrar acompanhamento de ${a.aluno}`}
                      >
                        Registrar
                      </Link>
                    ) : (
                      'Período fechado'
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default ProfessorTurmas;
