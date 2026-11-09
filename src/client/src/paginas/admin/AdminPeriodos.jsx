// ============================================================
// paginas/admin/AdminPeriodos.jsx  (tela 4 do administrador)
// RF04: o administrador define a data e a hora de abertura e de
// encerramento da digitação de cada bimestre. É o passo "abre o
// bimestre" do cenário de ponta a ponta do PI.
// ============================================================
import { useState } from 'react';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarBimestres } from '../../servicos/servicoConta';
import { salvarPeriodo } from '../../servicos/servicoAdmin';
import { useBusca } from '../../utilitarios/useBusca';
import { nomeBimestre } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import LinhaMensagem from '../../componentes/LinhaMensagem';

// Uma linha da tabela = um mini formulário com seu próprio estado.
function LinhaBimestre({ bimestre, aoSalvar }) {
  const { token } = useAutenticacao();
  const [abertura, setAbertura] = useState(bimestre.abertura);
  const [encerramento, setEncerramento] = useState(bimestre.encerramento);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const mudou = abertura !== bimestre.abertura || encerramento !== bimestre.encerramento;

  async function lidarComSalvar() {
    setErro(null);
    if (!abertura || !encerramento) {
      setErro('Preencha as duas datas.');
      return;
    }
    if (encerramento <= abertura) {
      setErro('O encerramento precisa ser depois da abertura.');
      return;
    }
    setSalvando(true);
    try {
      await salvarPeriodo(bimestre.id, abertura, encerramento, token);
      aoSalvar(`${nomeBimestre(bimestre.numero)} atualizado.`);
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  const idErro = `erro-periodo-${bimestre.numero}`;
  return (
    <tr>
      <th scope="row">{nomeBimestre(bimestre.numero)}</th>
      <td>
        <label htmlFor={`abertura-${bimestre.numero}`} className="visualmente-oculto">Abertura do {nomeBimestre(bimestre.numero)}</label>
        <input
          type="datetime-local"
          id={`abertura-${bimestre.numero}`}
          value={abertura}
          onChange={(e) => setAbertura(e.target.value)}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={idErro}
        />
      </td>
      <td>
        <label htmlFor={`encerramento-${bimestre.numero}`} className="visualmente-oculto">Encerramento do {nomeBimestre(bimestre.numero)}</label>
        <input
          type="datetime-local"
          id={`encerramento-${bimestre.numero}`}
          value={encerramento}
          onChange={(e) => setEncerramento(e.target.value)}
          aria-invalid={erro ? 'true' : undefined}
          aria-describedby={idErro}
        />
        <span id={idErro}>{erro}</span>
      </td>
      <td>
        <span className={`status status--${bimestre.aberto ? 'publicado' : 'rascunho'}`}>
          {bimestre.aberto ? 'Aberto' : 'Fechado'}
        </span>
      </td>
      <td>
        <button type="button" onClick={lidarComSalvar} disabled={!mudou || salvando}>
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </td>
    </tr>
  );
}

function AdminPeriodos() {
  const { token } = useAutenticacao();
  const anoAtual = new Date().getFullYear();
  const [ano, setAno] = useState(String(anoAtual));
  const [mensagem, setMensagem] = useState(null);
  const bimestres = useBusca(() => buscarBimestres(token, ano), [token, ano]);

  function aposSalvar(texto) {
    setMensagem(texto);
    bimestres.recarregar();
  }

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/admin' }, { texto: 'Períodos' }]} />
      <h1>Períodos de digitação</h1>

      <section aria-labelledby="titulo-periodos">
        <h2 id="titulo-periodos">Bimestres</h2>
        <p>O professor só consegue registrar e editar acompanhamentos dentro destes períodos. Horário de Brasília.</p>

        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="periodo-ano">Ano letivo</label>
            <select id="periodo-ano" value={ano} onChange={(e) => { setAno(e.target.value); setMensagem(null); }}>
              {[anoAtual - 1, anoAtual, anoAtual + 1].map((a) => (
                <option key={a} value={String(a)}>{a}</option>
              ))}
            </select>
          </div>
        </form>

        {mensagem && <div role="alert" className="sucesso">{mensagem}</div>}

        <table>
          <caption>Abertura e encerramento da digitação de {ano}</caption>
          <thead>
            <tr>
              <th scope="col">Bimestre</th>
              <th scope="col">Abertura</th>
              <th scope="col">Encerramento</th>
              <th scope="col">Situação</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {bimestres.carregando && <LinhaMensagem colunas={5} texto="Carregando..." />}
            {bimestres.erro && <LinhaMensagem colunas={5} texto={bimestres.erro} erro />}
            {!bimestres.carregando && !bimestres.erro && bimestres.dados.length === 0 && (
              <LinhaMensagem colunas={5} texto={`Os bimestres de ${ano} ainda não foram cadastrados no banco.`} />
            )}
            {!bimestres.carregando &&
              !bimestres.erro &&
              bimestres.dados.map((b) => <LinhaBimestre key={b.id} bimestre={b} aoSalvar={aposSalvar} />)}
          </tbody>
        </table>
      </section>
    </main>
  );
}

export default AdminPeriodos;
