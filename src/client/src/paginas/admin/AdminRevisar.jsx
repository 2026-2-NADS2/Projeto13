// ============================================================
// paginas/admin/AdminRevisar.jsx  (tela 3 do administrador)
// Revisar UM acompanhamento: ver, alterar o conteúdo (com
// justificativa), decidir (publicar / devolver / cancelar) e
// consultar o histórico (RF06 e RF07).
// ============================================================
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarTags } from '../../servicos/servicoConta';
import { buscarAcompanhamento, buscarHistorico, alterarConteudo, decidir } from '../../servicos/servicoAdmin';
import { useBusca } from '../../utilitarios/useBusca';
import { erroDaMedia, lerMedia } from '../../utilitarios/validacao';
import { formatarDataHora, nomeBimestre, NOMES_STATUS } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import LinhaMensagem from '../../componentes/LinhaMensagem';
import MensagemFormulario from '../../componentes/MensagemFormulario';
import SeletorTags from '../../componentes/SeletorTags';

// Compara duas listas de ids sem ligar para a ordem.
function mesmasTags(a, b) {
  return JSON.stringify([...a].sort((x, y) => x - y)) === JSON.stringify([...b].sort((x, y) => x - y));
}

// ------------------------------------------------------------
// Formulário de CONTEÚDO. "original" é o que o professor mandou;
// guardamos para comparar no envio: se algo mudou, a justificativa
// é obrigatória (regra de auditoria).
// ------------------------------------------------------------
function FormularioConteudo({ original, editavel, aoSalvar }) {
  const { token } = useAutenticacao();
  const tags = useBusca(() => buscarTags(token), [token]);

  const [descricao, setDescricao] = useState(original.descricao);
  const [media, setMedia] = useState(String(original.media));
  const [tagsMarcadas, setTagsMarcadas] = useState(original.tags);
  const [justificativa, setJustificativa] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const mudou =
    descricao.trim() !== original.descricao ||
    lerMedia(media) !== original.media ||
    !mesmasTags(tagsMarcadas, original.tags);

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    setMensagem(null);
    const e = {};
    if (!descricao.trim()) e.descricao = 'A descrição não pode ficar vazia.';
    const erroMedia = erroDaMedia(media);
    if (erroMedia) e.media = erroMedia;
    if (!mudou) e.geral = 'Nenhuma alteração foi feita.';
    else if (!justificativa.trim()) e.justificativa = 'Explique por que você alterou o conteúdo.';
    setErros(e);
    if (e.geral) setMensagem({ tipo: 'erro', texto: e.geral });
    if (Object.keys(e).length > 0) return;

    setEnviando(true);
    try {
      await alterarConteudo(
        original.id,
        { descricao: descricao.trim(), media: lerMedia(media), tags: tagsMarcadas, justificativa: justificativa.trim() },
        token,
      );
      aoSalvar('Alterações salvas. O acompanhamento está em revisão.');
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setEnviando(false);
    }
  }

  const travado = !editavel || enviando;

  return (
    <section aria-labelledby="titulo-conteudo">
      <h2 id="titulo-conteudo">Conteúdo</h2>
      <form id="form-conteudo" noValidate onSubmit={lidarComEnvio}>
        <MensagemFormulario id="mensagem-conteudo" mensagem={mensagem} />
        <div>
          <label htmlFor="campo-descricao">Descrição do acompanhamento</label>
          <textarea
            id="campo-descricao"
            rows={8}
            maxLength={2000}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            disabled={travado}
            aria-invalid={erros.descricao ? 'true' : undefined}
            aria-describedby="erro-descricao"
          />
          <span id="erro-descricao">{erros.descricao}</span>
        </div>
        <div>
          <label htmlFor="campo-media">Média do bimestre</label>
          <input
            type="number"
            id="campo-media"
            min="0"
            max="10"
            step="0.1"
            inputMode="decimal"
            value={media}
            onChange={(e) => setMedia(e.target.value)}
            disabled={travado}
            aria-invalid={erros.media ? 'true' : undefined}
            aria-describedby="erro-media"
          />
          <span id="erro-media">{erros.media}</span>
        </div>

        <SeletorTags
          tags={tags.dados}
          carregando={tags.carregando}
          erro={tags.erro}
          selecionadas={tagsMarcadas}
          aoMudar={setTagsMarcadas}
          desabilitado={travado}
        />

        {editavel && (
          <>
            <div>
              <label htmlFor="campo-justificativa">Justificativa da alteração</label>
              <textarea
                id="campo-justificativa"
                rows={3}
                maxLength={500}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                disabled={travado}
                aria-invalid={erros.justificativa ? 'true' : undefined}
                aria-describedby="dica-justificativa erro-justificativa"
              />
              <small id="dica-justificativa">
                {mudou ? 'Obrigatória: você alterou o conteúdo enviado pelo professor.' : 'Obrigatória se você alterar a descrição, a média ou os pontos observados.'}
              </small>
              <span id="erro-justificativa">{erros.justificativa}</span>
            </div>
            <button type="submit" disabled={enviando}>
              {enviando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </>
        )}
      </form>
    </section>
  );
}

// ------------------------------------------------------------
// Formulário de DECISÃO. As opções vêm da API (decisoes), que já
// sabe o que é permitido no status atual.
// ------------------------------------------------------------
const TEXTO_DECISAO = {
  publicado: 'Publicar para o responsável',
  devolvido: 'Devolver ao professor para ajustes',
  cancelado: 'Cancelar este acompanhamento',
};

function FormularioDecisao({ acompanhamento, aoDecidir }) {
  const { token } = useAutenticacao();
  const [decisao, setDecisao] = useState('');
  const [motivo, setMotivo] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  if (acompanhamento.decisoes.length === 0) {
    return (
      <section aria-labelledby="titulo-decisao">
        <h2 id="titulo-decisao">Decisão</h2>
        <p>
          {acompanhamento.status === 'rascunho' || acompanhamento.status === 'devolvido'
            ? 'Este acompanhamento está com o professor. A decisão fica disponível quando ele for enviado para revisão.'
            : 'Nenhuma decisão disponível para este status.'}
        </p>
      </section>
    );
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    setMensagem(null);
    const e = {};
    if (!decisao) e.decisao = 'Escolha uma opção.';
    if ((decisao === 'devolvido' || decisao === 'cancelado') && !motivo.trim()) {
      e.motivo = 'Informe o motivo. Na devolução, ele será mostrado ao professor.';
    }
    setErros(e);
    if (Object.keys(e).length > 0) return;

    // Confirmação nas ações de impacto (análise de usabilidade,
    // heurística 3): publicar mostra o relatório à família, e
    // cancelar tira o trabalho do professor do fluxo.
    const perguntas = {
      publicado: `Publicar? O relatório de ${acompanhamento.aluno} ficará visível para a família.`,
      devolvido: 'Devolver ao professor para ajustes?',
      cancelado: 'Cancelar este acompanhamento? Ele sai do fluxo e não poderá ser publicado.',
    };
    if (!window.confirm(perguntas[decisao])) return;

    setEnviando(true);
    try {
      await decidir(acompanhamento.id, decisao, motivo.trim(), token);
      aoDecidir(`Pronto! Novo status: ${NOMES_STATUS[decisao]}.`);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-decisao">
      <h2 id="titulo-decisao">Decisão</h2>
      <form id="form-decisao" noValidate onSubmit={lidarComEnvio}>
        <MensagemFormulario id="mensagem-decisao" mensagem={mensagem} />
        <fieldset>
          <legend>O que fazer com este acompanhamento?</legend>
          {acompanhamento.decisoes.map((opcao) => (
            <div key={opcao}>
              <input
                type="radio"
                id={`decisao-${opcao}`}
                name="decisao"
                value={opcao}
                checked={decisao === opcao}
                onChange={(e) => setDecisao(e.target.value)}
                aria-invalid={erros.decisao ? 'true' : undefined}
                aria-describedby="erro-decisao"
              />
              <label htmlFor={`decisao-${opcao}`}>{TEXTO_DECISAO[opcao]}</label>
            </div>
          ))}
          <span id="erro-decisao">{erros.decisao}</span>
        </fieldset>
        <div>
          <label htmlFor="campo-motivo">Motivo</label>
          <textarea
            id="campo-motivo"
            rows={3}
            maxLength={500}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            aria-invalid={erros.motivo ? 'true' : undefined}
            aria-describedby="dica-motivo erro-motivo"
          />
          <small id="dica-motivo">Obrigatório para devolver ou cancelar. Na devolução, este texto será mostrado ao professor.</small>
          <span id="erro-motivo">{erros.motivo}</span>
        </div>
        <button type="submit" disabled={enviando}>
          {enviando ? 'Confirmando...' : 'Confirmar decisão'}
        </button>
      </form>
    </section>
  );
}

// ------------------------------------------------------------
// A página
// ------------------------------------------------------------
function AdminRevisar() {
  const { token } = useAutenticacao();
  const { id } = useParams();
  const [mensagem, setMensagem] = useState(null);

  const ac = useBusca(() => buscarAcompanhamento(id, token), [id, token]);
  const historico = useBusca(() => buscarHistorico(id, token), [id, token]);

  // Depois de salvar ou decidir: mostra a mensagem e busca tudo de novo.
  function aposAcao(texto) {
    setMensagem(texto);
    ac.recarregar();
    historico.recarregar();
    window.scrollTo(0, 0);
  }

  const a = ac.dados;

  return (
    <main>
      <Trilha
        itens={[
          { texto: 'Início', para: '/admin' },
          { texto: 'Revisão', para: '/admin/revisao' },
          { texto: 'Revisar acompanhamento' },
        ]}
      />

      <h1 id="titulo-pagina">{a ? `${a.aluno} – ${a.disciplina} – ${nomeBimestre(a.bimestre)}` : 'Revisar acompanhamento'}</h1>

      {mensagem && <div role="alert" className="sucesso">{mensagem}</div>}
      {ac.carregando && <p id="mensagem-carregamento" role="status">Carregando acompanhamento...</p>}
      {ac.erro && <p id="mensagem-carregamento" role="status" className="erro">{ac.erro}</p>}

      {!ac.carregando && a && (
        <>
          <section aria-labelledby="titulo-identificacao">
            <h2 id="titulo-identificacao">Identificação</h2>
            <dl>
              <div><dt>Aluno</dt><dd id="revisar-aluno">{a.aluno}</dd></div>
              <div><dt>Turma</dt><dd id="revisar-turma">{a.turma}</dd></div>
              <div><dt>Disciplina</dt><dd id="revisar-disciplina">{a.disciplina}</dd></div>
              <div><dt>Professor(a)</dt><dd id="revisar-professor">{a.professor}</dd></div>
              <div><dt>Bimestre</dt><dd id="revisar-bimestre">{nomeBimestre(a.bimestre)} de {a.anoLetivo}</dd></div>
              <div><dt>Status atual</dt><dd id="revisar-status"><EtiquetaStatus status={a.status} /></dd></div>
            </dl>
          </section>

          <FormularioConteudo key={`c-${a.id}`} original={a} editavel={a.editavel} aoSalvar={aposAcao} />
          <FormularioDecisao key={`d-${a.id}`} acompanhamento={a} aoDecidir={aposAcao} />

          {a.status === 'publicado' && (
            <section aria-labelledby="titulo-retorno">
              <h2 id="titulo-retorno">Ciência dos responsáveis</h2>
              {a.ciencias.length === 0 ? (
                <p>Nenhum responsável registrou ciência ainda.</p>
              ) : (
                <ul>
                  {a.ciencias.map((c) => (
                    <li key={c.responsavel + c.registradaEm}>
                      <strong>{c.responsavel}</strong> em {formatarDataHora(c.registradaEm)}
                      {c.observacao ? `: "${c.observacao}"` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}

      <section aria-labelledby="titulo-historico">
        <h2 id="titulo-historico">Histórico</h2>
        <table>
          <caption>Alterações e mudanças de status deste acompanhamento</caption>
          <thead>
            <tr>
              <th scope="col">Data e hora</th>
              <th scope="col">Usuário</th>
              <th scope="col">Status anterior</th>
              <th scope="col">Novo status</th>
              <th scope="col">Motivo / justificativa</th>
            </tr>
          </thead>
          <tbody id="tabela-historico">
            {historico.carregando && <LinhaMensagem colunas={5} texto="Carregando..." />}
            {historico.erro && <LinhaMensagem colunas={5} texto={historico.erro} erro />}
            {!historico.carregando && !historico.erro && historico.dados.length === 0 && (
              <LinhaMensagem colunas={5} texto="Sem registros no histórico." />
            )}
            {!historico.carregando &&
              !historico.erro &&
              historico.dados.map((h) => (
                <tr key={h.id}>
                  <td>{formatarDataHora(h.dataHora)}</td>
                  <td>{h.usuario}</td>
                  <td>{h.anterior ? <EtiquetaStatus status={h.anterior} /> : 'Criado'}</td>
                  <td><EtiquetaStatus status={h.posterior} /></td>
                  <td>{h.observacao || '-'}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <p>
        <Link to="/admin/revisao">Voltar para a revisão</Link>
      </p>
    </main>
  );
}

export default AdminRevisar;
