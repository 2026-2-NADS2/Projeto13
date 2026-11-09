// ============================================================
// paginas/responsavel/ResponsavelRelatorio.jsx  (tela 3 de 4)
// Um relatório completo: dados, descrição do professor, pontos
// observados, PDF e registro de ciência (RF09 e RF12).
//
// O id vem da URL /responsavel/relatorios/:id (useParams). Qualquer
// pessoa pode trocar o número na barra de endereço; quem impede
// ver o relatório de outra família é a API (responde 404).
// ============================================================
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarRelatorio, registrarCiencia } from '../../servicos/servicoResponsavel';
import { useBusca } from '../../utilitarios/useBusca';
import { formatarData, formatarDataHora, formatarMedia, nomeBimestre } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import MensagemFormulario from '../../componentes/MensagemFormulario';

// ------------------------------------------------------------
// Formulário de ciência, separado em um componente próprio porque
// tem o seu próprio estado. Quando registra, avisa o pai
// (aoRegistrar) para recarregar o relatório.
// ------------------------------------------------------------
function FormularioCiencia({ idRelatorio, aoRegistrar }) {
  const { token } = useAutenticacao();
  const [confirmado, setConfirmado] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    const novosErros = {};
    if (!confirmado) novosErros.confirmacao = 'Marque a caixa para confirmar que leu o relatório.';
    if (observacao.length > 500) novosErros.observacao = 'A observação pode ter no máximo 500 caracteres.';
    setErros(novosErros);
    if (Object.keys(novosErros).length > 0) return;

    setEnviando(true);
    setMensagem(null);
    try {
      await registrarCiencia(idRelatorio, observacao, token);
      aoRegistrar();
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setEnviando(false);
    }
  }

  return (
    <form id="form-ciencia" noValidate onSubmit={lidarComEnvio}>
      <MensagemFormulario id="mensagem-ciencia" mensagem={mensagem} />
      <div>
        <input
          type="checkbox"
          id="ciencia-confirmacao"
          checked={confirmado}
          onChange={(e) => setConfirmado(e.target.checked)}
          aria-invalid={erros.confirmacao ? 'true' : undefined}
          aria-describedby="erro-confirmacao"
        />
        <label htmlFor="ciencia-confirmacao">Declaro que li este relatório de acompanhamento.</label>
        <span id="erro-confirmacao">{erros.confirmacao}</span>
      </div>
      <div>
        <label htmlFor="ciencia-observacao">Observação para a escola (opcional)</label>
        <textarea
          id="ciencia-observacao"
          rows={4}
          maxLength={500}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          aria-invalid={erros.observacao ? 'true' : undefined}
          aria-describedby="dica-observacao erro-observacao"
        />
        <small id="dica-observacao">
          Até 500 caracteres ({500 - observacao.length} restantes). Será lida pelo(a) professor(a) e pela coordenação.
        </small>
        <span id="erro-observacao">{erros.observacao}</span>
      </div>
      <button type="submit" disabled={enviando}>
        {enviando ? 'Registrando...' : 'Registrar ciência'}
      </button>
    </form>
  );
}

function ResponsavelRelatorio() {
  const { token } = useAutenticacao();
  const { id } = useParams(); // texto: "7" para /responsavel/relatorios/7
  const { dados: r, carregando, erro, recarregar } = useBusca(() => buscarRelatorio(id, token), [id, token]);

  const trilha = (
    <Trilha
      itens={[
        { texto: 'Início', para: '/responsavel' },
        { texto: 'Relatórios', para: '/responsavel/relatorios' },
        { texto: 'Detalhe do relatório' },
      ]}
    />
  );

  // Retornos antecipados (capítulo 6): enquanto carrega ou com erro,
  // a tela mostra só a mensagem, sem campos vazios ("-") poluindo.
  if (carregando || erro) {
    return (
      <main>
        {trilha}
        <p id="mensagem-carregamento" role="status" className={erro ? 'erro' : undefined}>
          {erro || 'Carregando relatório...'}
        </p>
        <p>
          <Link to="/responsavel/relatorios">Voltar para os relatórios</Link>
        </p>
      </main>
    );
  }

  return (
    <main>
      {trilha}

      <article aria-labelledby="titulo-relatorio">
        <h1 id="titulo-relatorio">
          {r.disciplina} – {nomeBimestre(r.bimestre)} de {r.anoLetivo}
        </h1>

        <dl>
          <div><dt>Aluno</dt><dd id="relatorio-aluno">{r.aluno}</dd></div>
          <div><dt>Turma</dt><dd id="relatorio-turma">{r.turma}</dd></div>
          <div><dt>Disciplina</dt><dd id="relatorio-disciplina">{r.disciplina}</dd></div>
          <div><dt>Professor(a)</dt><dd id="relatorio-professor">{r.professor}</dd></div>
          <div><dt>Bimestre</dt><dd id="relatorio-bimestre">{nomeBimestre(r.bimestre)}</dd></div>
          <div><dt>Média do bimestre</dt><dd id="relatorio-media">{formatarMedia(r.media)}</dd></div>
          <div>
            <dt>Publicado em</dt>
            <dd id="relatorio-publicado-em">
              <time dateTime={r.publicadoEm}>{formatarData(r.publicadoEm)}</time>
            </dd>
          </div>
        </dl>

        <section aria-labelledby="titulo-descricao">
          <h2 id="titulo-descricao">Descrição do acompanhamento</h2>
          {/* XSS: no JSX, {texto} é SEMPRE mostrado como texto. Mesmo
              que a descrição tenha "<script>", o React não executa
              (é o textContent da Entrega 1, automático). */}
          <p id="relatorio-descricao">{r.descricao}</p>
        </section>

        {/* Seção vazia não aparece (análise de usabilidade, heurística 8). */}
        {r.tags.length > 0 && (
          <section aria-labelledby="titulo-tags">
            <h2 id="titulo-tags">Pontos observados</h2>
            <ul id="relatorio-tags">
              {r.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </section>
        )}

        <section aria-labelledby="titulo-pdf" className="nao-imprimir">
          <h2 id="titulo-pdf">Baixar relatório</h2>
          {/* RF09: abre a janela de impressão; lá, escolha "Salvar
              como PDF". O CSS (@media print) esconde menu e botões. */}
          <button type="button" id="botao-pdf" onClick={() => window.print()}>
            Baixar em PDF
          </button>
          <small>Na janela que abrir, escolha o destino &quot;Salvar como PDF&quot;.</small>
        </section>

        <section aria-labelledby="titulo-ciencia">
          <h2 id="titulo-ciencia">Ciência do responsável</h2>
          {r.ciencia ? (
            <>
              <div role="alert" className="sucesso" id="status-ciencia">
                Ciência registrada em {formatarDataHora(r.ciencia.registradaEm)}.
              </div>
              {r.ciencia.observacao && <p id="retorno-observacao">Sua observação: {r.ciencia.observacao}</p>}
            </>
          ) : (
            <FormularioCiencia idRelatorio={r.id} aoRegistrar={recarregar} />
          )}
        </section>
      </article>

      <p className="nao-imprimir">
        <Link to="/responsavel/relatorios">Voltar para os relatórios</Link>
      </p>
    </main>
  );
}

export default ResponsavelRelatorio;
