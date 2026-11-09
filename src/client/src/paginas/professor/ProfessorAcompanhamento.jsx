// ============================================================
// paginas/professor/ProfessorAcompanhamento.jsx  (tela 3 do professor)
// A tela mais complexa do projeto. Abre de três jeitos:
//   /professor/acompanhamento                      -> formulário vazio
//   /professor/acompanhamento?turma=1&disciplina=1&aluno=3&bimestre=4
//                                                  -> já preenchido (vindo de "Minhas turmas")
//   /professor/acompanhamento/15                   -> editar/ver um registro
//
// Se o status não for "rascunho" nem "devolvido", ou se o período
// estiver fechado, o formulário fica SÓ PARA LEITURA.
//
// Organização: a PÁGINA busca os dados; o FORMULÁRIO é um componente
// separado que recebe os valores iniciais por props e cuida do
// próprio estado (formulário controlado).
// ============================================================
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarBimestres, buscarTags } from '../../servicos/servicoConta';
import {
  buscarMinhasTurmas, buscarAlunosDaTurma, buscarAcompanhamento, criarAcompanhamento, atualizarAcompanhamento,
} from '../../servicos/servicoProfessor';
import { useBusca } from '../../utilitarios/useBusca';
import { erroDaMedia, lerMedia } from '../../utilitarios/validacao';
import { formatarDataHora, formatarPrazo, nomeBimestre } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import EtiquetaStatus from '../../componentes/EtiquetaStatus';
import MensagemFormulario from '../../componentes/MensagemFormulario';
import SeletorTags from '../../componentes/SeletorTags';

const LIMITE_DESCRICAO = 2000;

// ------------------------------------------------------------
// O formulário. "registro" é o acompanhamento já salvo (ou null
// quando é novo); "inicial" traz turma/aluno/bimestre da URL.
// ------------------------------------------------------------
function FormularioAcompanhamento({ registro, inicial, turmas, bimestres, aoSalvar }) {
  const { token } = useAutenticacao();
  const novo = !registro;

  // Estado inicial: do registro (editar) ou da URL (novo).
  const [campos, setCampos] = useState(() =>
    novo
      ? { turma: inicial.turma, aluno: inicial.aluno, bimestre: inicial.bimestre, descricao: '', media: '' }
      : {
          turma: `${registro.turmaId}-${registro.disciplinaId}`,
          aluno: String(registro.alunoId),
          bimestre: String(registro.bimestre),
          descricao: registro.descricao,
          media: String(registro.media),
        },
  );
  const [tagsMarcadas, setTagsMarcadas] = useState(novo ? [] : registro.tags);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const tags = useBusca(() => buscarTags(token), [token]);

  // Alunos da turma escolhida (só no modo "novo"). O bimestre entra
  // para sabermos quem JÁ tem registro naquele bimestre.
  const [turmaId, disciplinaId] = campos.turma ? campos.turma.split('-') : [];
  const bimestreParaLista = campos.bimestre || String(bimestres.find((b) => b.aberto)?.numero ?? 1);
  const alunos = useBusca(
    () => (novo && turmaId ? buscarAlunosDaTurma(turmaId, disciplinaId, bimestreParaLista, token) : Promise.resolve(null)),
    [novo, turmaId, disciplinaId, bimestreParaLista, token],
  );

  // Período: no registro salvo vem da API; no novo, da lista de bimestres.
  const bimestreEscolhido = bimestres.find((b) => String(b.numero) === campos.bimestre);
  const periodo = novo ? bimestreEscolhido : registro.periodo;
  const editavel = novo ? !bimestreEscolhido || bimestreEscolhido.aberto : registro.editavel;

  function mudar(nome, valor) {
    // Corrigiu o campo? O erro dele some na hora (não precisa reenviar).
    setErros((atual) => ({ ...atual, [nome]: undefined }));
    setCampos((atual) => {
      const proximo = { ...atual, [nome]: valor };
      // Trocou a turma? O aluno escolhido não vale mais.
      if (nome === 'turma') proximo.aluno = '';
      return proximo;
    });
  }

  function validar() {
    const e = {};
    if (!campos.turma) e.turma = 'Escolha a turma e a disciplina.';
    if (!campos.aluno) e.aluno = 'Escolha o aluno.';
    if (!campos.bimestre) e.bimestre = 'Escolha o bimestre.';
    else if (periodo && !periodo.aberto) e.bimestre = 'O período de digitação deste bimestre está fechado.';
    if (!campos.descricao.trim()) e.descricao = 'Escreva a descrição do acompanhamento.';
    else if (campos.descricao.length > LIMITE_DESCRICAO) e.descricao = `Use no máximo ${LIMITE_DESCRICAO} caracteres.`;
    const erroMedia = erroDaMedia(campos.media);
    if (erroMedia) e.media = erroMedia;
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    // Os DOIS botões são "submit". O submitter diz qual foi clicado:
    // value="rascunho" ou value="enviar".
    const acao = evento.nativeEvent.submitter?.value === 'enviar' ? 'enviar' : 'rascunho';
    setMensagem(null);
    if (!validar()) return;

    if (acao === 'enviar' && !window.confirm('Depois de enviado, o registro só poderá ser editado se a coordenação devolvê-lo. Enviar para revisão?')) {
      return;
    }

    const conteudo = {
      descricao: campos.descricao.trim(),
      media: lerMedia(campos.media),
      tags: tagsMarcadas,
      acao,
    };

    setEnviando(true);
    try {
      const salvo = novo
        ? await criarAcompanhamento(
            { ...conteudo, turmaId: Number(turmaId), disciplinaId: Number(disciplinaId), alunoId: Number(campos.aluno), bimestre: Number(campos.bimestre) },
            token,
          )
        : await atualizarAcompanhamento(registro.id, conteudo, token);
      aoSalvar(salvo, acao === 'enviar' ? 'Acompanhamento enviado para revisão da coordenação.' : 'Rascunho salvo.');
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
      setEnviando(false);
    }
  }

  const travado = !editavel || enviando;

  return (
    <>
      <section aria-labelledby="titulo-situacao">
        <h2 id="titulo-situacao">Situação</h2>
        <dl>
          <div>
            <dt>Status</dt>
            <dd id="status-acompanhamento">{novo ? 'Novo' : <EtiquetaStatus status={registro.status} />}</dd>
          </div>
          <div>
            <dt>Período de digitação</dt>
            <dd id="periodo-acompanhamento">
              {!periodo ? '-' : periodo.aberto ? `Aberto até ${formatarPrazo(periodo.encerramento)}` : 'Fechado'}
            </dd>
          </div>
        </dl>

        {!novo && registro.status === 'devolvido' && (
          <div id="bloco-devolucao">
            <h3>Ajustes solicitados pela coordenação</h3>
            <p id="motivo-devolucao">{registro.motivoDevolucao || 'A coordenação não informou o motivo.'}</p>
          </div>
        )}
      </section>

      <section aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">Dados do acompanhamento</h2>

        <form id="form-acompanhamento" noValidate onSubmit={lidarComEnvio}>
          <MensagemFormulario id="mensagem-acompanhamento" mensagem={mensagem} />
          {!editavel && !novo && (
            <div role="alert">
              {registro.periodo.aberto
                ? 'Este acompanhamento já foi enviado e não pode mais ser editado.'
                : 'O período de digitação deste bimestre está fechado. O registro está só para leitura.'}
            </div>
          )}

          <fieldset>
            <legend>Aluno e período</legend>

            <div>
              <label htmlFor="campo-turma">Turma e disciplina</label>
              <select
                id="campo-turma"
                value={campos.turma}
                onChange={(e) => mudar('turma', e.target.value)}
                disabled={!novo || enviando}
                aria-invalid={erros.turma ? 'true' : undefined}
                aria-describedby="erro-turma"
              >
                <option value="">Selecione</option>
                {turmas.map((t) => (
                  <option key={`${t.turmaId}-${t.disciplinaId}`} value={`${t.turmaId}-${t.disciplinaId}`}>
                    {t.turma} – {t.disciplina}
                  </option>
                ))}
                {/* Registro de uma turma que o professor não tem mais:
                    mostra mesmo assim, para a tela não ficar em branco. */}
                {!novo && !turmas.some((t) => `${t.turmaId}-${t.disciplinaId}` === campos.turma) && (
                  <option value={campos.turma}>{registro.turma} – {registro.disciplina}</option>
                )}
              </select>
              <span id="erro-turma">{erros.turma}</span>
            </div>

            <div>
              <label htmlFor="campo-aluno">Aluno</label>
              <select
                id="campo-aluno"
                value={campos.aluno}
                onChange={(e) => mudar('aluno', e.target.value)}
                disabled={!novo || !campos.turma || enviando}
                aria-invalid={erros.aluno ? 'true' : undefined}
                aria-describedby="erro-aluno"
              >
                {novo ? (
                  <>
                    <option value="">
                      {!campos.turma ? 'Selecione a turma primeiro' : alunos.carregando ? 'Carregando...' : 'Selecione'}
                    </option>
                    {/* Quem já tem registro neste bimestre aparece desabilitado */}
                    {alunos.dados?.alunos.map((a) => (
                      <option key={a.alunoId} value={String(a.alunoId)} disabled={!!a.acompanhamentoId}>
                        {a.aluno}{a.acompanhamentoId ? ' (já registrado)' : ''}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value={campos.aluno}>{registro.aluno}</option>
                )}
              </select>
              {alunos.erro && <small>{alunos.erro}</small>}
              <span id="erro-aluno">{erros.aluno}</span>
            </div>

            <div>
              <label htmlFor="campo-bimestre">Bimestre</label>
              <select
                id="campo-bimestre"
                value={campos.bimestre}
                onChange={(e) => mudar('bimestre', e.target.value)}
                disabled={!novo || enviando}
                aria-invalid={erros.bimestre ? 'true' : undefined}
                aria-describedby="erro-bimestre"
              >
                <option value="">Selecione</option>
                {[1, 2, 3, 4].map((n) => {
                  const b = bimestres.find((x) => x.numero === n);
                  return (
                    <option key={n} value={String(n)}>
                      {nomeBimestre(n)}{b && !b.aberto ? ' (fechado)' : ''}
                    </option>
                  );
                })}
              </select>
              <span id="erro-bimestre">{erros.bimestre}</span>
            </div>
          </fieldset>

          <fieldset>
            <legend>Avaliação</legend>

            <div>
              <label htmlFor="campo-descricao">Descrição do acompanhamento</label>
              <textarea
                id="campo-descricao"
                rows={8}
                maxLength={LIMITE_DESCRICAO}
                value={campos.descricao}
                onChange={(e) => mudar('descricao', e.target.value)}
                disabled={travado}
                aria-invalid={erros.descricao ? 'true' : undefined}
                aria-describedby="dica-descricao erro-descricao"
              />
              <small id="dica-descricao">
                {campos.descricao.length} de {LIMITE_DESCRICAO} caracteres. Este texto será lido pela família depois da
                revisão da coordenação. Descreva o desenvolvimento escolar, sem expor informações pessoais ou de saúde
                desnecessárias.
              </small>
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
                value={campos.media}
                onChange={(e) => mudar('media', e.target.value)}
                disabled={travado}
                aria-invalid={erros.media ? 'true' : undefined}
                aria-describedby="dica-media erro-media"
              />
              <small id="dica-media">De 0 a 10, com até uma casa decimal.</small>
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
          </fieldset>

          {editavel && (
            <>
              <div>
                <button type="submit" value="rascunho" disabled={enviando}>
                  {enviando ? 'Salvando...' : 'Salvar rascunho'}
                </button>
                <button type="submit" value="enviar" disabled={enviando}>
                  Enviar para revisão
                </button>
              </div>
              <p>Depois de enviado para revisão, o registro só poderá ser editado se a coordenação devolvê-lo para ajustes.</p>
            </>
          )}
        </form>
      </section>
    </>
  );
}

// ------------------------------------------------------------
// A página: busca turmas, bimestres e (se tiver id) o registro.
// ------------------------------------------------------------
function ProfessorAcompanhamento() {
  const { token } = useAutenticacao();
  const { id } = useParams();
  const [parametrosUrl] = useSearchParams();
  const navegar = useNavigate();
  const local = useLocation();

  // Mensagem de sucesso que veio da tela anterior (depois de criar).
  const [mensagem, setMensagem] = useState(local.state?.mensagem ?? null);

  const turmas = useBusca(() => buscarMinhasTurmas(token), [token]);
  const bimestres = useBusca(() => buscarBimestres(token), [token]);
  const registro = useBusca(() => (id ? buscarAcompanhamento(id, token) : Promise.resolve(null)), [id, token]);

  const turmaUrl = parametrosUrl.get('turma');
  const disciplinaUrl = parametrosUrl.get('disciplina');
  const inicial = {
    turma: turmaUrl && disciplinaUrl ? `${turmaUrl}-${disciplinaUrl}` : '',
    aluno: parametrosUrl.get('aluno') ?? '',
    bimestre: parametrosUrl.get('bimestre') ?? '',
  };

  function aoSalvar(salvo, texto) {
    if (!id) {
      // Criou: vai para o endereço do registro novo, levando a
      // mensagem no "state" da navegação.
      navegar(`/professor/acompanhamento/${salvo.id}`, { replace: true, state: { mensagem: texto } });
    } else {
      setMensagem(texto);
      registro.recarregar();
      window.scrollTo(0, 0);
    }
  }

  const carregando = turmas.carregando || bimestres.carregando || registro.carregando;
  const erro = turmas.erro || bimestres.erro || registro.erro;
  const r = registro.dados;

  return (
    <main>
      <Trilha
        itens={[
          { texto: 'Início', para: '/professor' },
          { texto: 'Minhas turmas', para: '/professor/turmas' },
          { texto: id ? 'Acompanhamento' : 'Registrar acompanhamento' },
        ]}
      />

      <h1 id="titulo-pagina">
        {!id ? 'Registrar acompanhamento' : r ? `${r.aluno} – ${r.disciplina} – ${nomeBimestre(r.bimestre)}` : 'Acompanhamento'}
      </h1>

      {mensagem && (
        <div role="alert" className="sucesso">{mensagem}</div>
      )}

      {carregando && <p role="status">Carregando...</p>}
      {!carregando && erro && <p role="status" className="erro">{erro}</p>}

      {!carregando && !erro && (
        // O formulário só aparece DEPOIS de carregar, então ele "nasce"
        // já com os valores certos. Ao salvar, recarregar() mostra
        // "Carregando..." de novo e o formulário nasce com os dados
        // atualizados. A key troca o formulário quando muda o registro.
        <FormularioAcompanhamento
          key={r ? r.id : 'novo'}
          registro={r}
          inicial={inicial}
          turmas={turmas.dados}
          bimestres={bimestres.dados}
          aoSalvar={aoSalvar}
        />
      )}

      {/* RF12: retorno do responsável, só nos publicados */}
      {r && r.status === 'publicado' && (
        <section id="secao-retorno" aria-labelledby="titulo-retorno">
          <h2 id="titulo-retorno">Retorno do responsável</h2>
          {r.ciencias.length === 0 ? (
            <p>Nenhum responsável registrou ciência ainda.</p>
          ) : (
            r.ciencias.map((c) => (
              <dl key={c.responsavel + c.registradaEm}>
                <div>
                  <dt>Ciência</dt>
                  <dd id="retorno-ciencia">{c.responsavel} em {formatarDataHora(c.registradaEm)}</dd>
                </div>
                <div>
                  <dt>Observação</dt>
                  <dd id="retorno-observacao">{c.observacao || 'Sem observação.'}</dd>
                </div>
              </dl>
            ))
          )}
        </section>
      )}

      <p>
        <Link to="/professor/turmas">Voltar para minhas turmas</Link>
      </p>
    </main>
  );
}

export default ProfessorAcompanhamento;
