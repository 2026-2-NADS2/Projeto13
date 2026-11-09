// ============================================================
// paginas/admin/AdminUsuarios.jsx  (tela 5 do administrador)
// CADASTRO DE USUÁRIOS - requisito da Entrega 2 ("autenticação de
// usuário: cadastro/login") e parte do RF02 do PI.
//
// A tela tem duas partes:
//   1. Formulário "Cadastrar usuário" (nome, e-mail, perfil, senha
//      inicial e, para responsável, os alunos vinculados).
//   2. Tabela com os usuários, filtro por perfil, paginação e o
//      botão Ativar/Inativar.
//
// Por que o cadastro fica com o ADMIN e não aberto na tela de login
// (como o "registro" da Aula 11)? Porque o sistema guarda dados de
// crianças (LGPD) e, pelo RF02, quem cadastra pais e professores é a
// escola. A explicação completa está em server/rotas/usuarios.js.
// ============================================================
import { useState } from 'react';
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import {
  buscarUsuarios, buscarAlunosParaVinculo, cadastrarUsuario, mudarAtivo,
} from '../../servicos/servicoAdmin';
import { useBusca } from '../../utilitarios/useBusca';
import { FORMATO_EMAIL, regrasDoPerfil } from '../../utilitarios/validacao';
import { contar } from '../../utilitarios/formatar';
import Trilha from '../../componentes/Trilha';
import MensagemFormulario from '../../componentes/MensagemFormulario';
import LinhaMensagem from '../../componentes/LinhaMensagem';
import Paginacao from '../../componentes/Paginacao';

// Nomes "de gente" para os valores do ENUM usuario.perfil.
const NOMES_PERFIL = {
  administrador: 'Administrador',
  professor: 'Professor(a)',
  responsavel: 'Responsável',
};

const CAMPOS_VAZIOS = { nome: '', email: '', perfil: '', senha: '', confirmacao: '' };
const COLUNAS = 6;

// ------------------------------------------------------------
// Parte 1: formulário de cadastro.
// aoCadastrar(texto) avisa a página (o pai) para mostrar a mensagem
// e recarregar a tabela - "filho avisa o pai" (capítulo 11).
// ------------------------------------------------------------
function FormularioCadastro({ aoCadastrar }) {
  const { token } = useAutenticacao();
  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  // Ids dos alunos marcados (só usado quando o perfil é responsável).
  const [alunosMarcados, setAlunosMarcados] = useState([]);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Lista de alunos para os checkboxes. Busca uma vez ao abrir a tela.
  const alunos = useBusca(() => buscarAlunosParaVinculo(token), [token]);

  // A regra de senha depende do perfil escolhido (admin = mais forte).
  const regra = regrasDoPerfil(campos.perfil);

  // Um onChange para todos os campos de texto (o "name" diz qual).
  function lidarComMudanca(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  // Marca/desmarca um aluno sem alterar o array antigo (imutabilidade).
  function alternarAluno(id) {
    setAlunosMarcados((atual) =>
      atual.includes(id) ? atual.filter((a) => a !== id) : [...atual, id]
    );
  }

  // Validação ANTES de chamar a API (as mesmas regras do servidor).
  function validar() {
    const e = {};
    if (!campos.nome.trim()) e.nome = 'Informe o nome completo.';
    else if (campos.nome.trim().length > 150) e.nome = 'O nome pode ter no máximo 150 caracteres.';

    if (!campos.email.trim()) e.email = 'Informe o e-mail.';
    else if (!FORMATO_EMAIL.test(campos.email.trim())) e.email = 'Digite um e-mail válido, como nome@exemplo.com.';

    if (!campos.perfil) e.perfil = 'Escolha o perfil.';

    if (!campos.senha) e.senha = 'Informe a senha inicial.';
    else if (!regra.valida(campos.senha)) e.senha = 'A senha não segue as regras acima.';

    if (!campos.confirmacao) e.confirmacao = 'Confirme a senha.';
    else if (campos.confirmacao !== campos.senha) e.confirmacao = 'As senhas não são iguais.';

    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault(); // não recarrega a página nem joga dados na URL
    setMensagem(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      const criado = await cadastrarUsuario(
        {
          nome: campos.nome.trim(),
          email: campos.email.trim(),
          perfil: campos.perfil,
          senha: campos.senha,
          // Só manda alunos se for responsável.
          alunoIds: campos.perfil === 'responsavel' ? alunosMarcados : [],
        },
        token
      );
      // Limpa o formulário para o próximo cadastro.
      setCampos(CAMPOS_VAZIOS);
      setAlunosMarcados([]);
      setErros({});
      aoCadastrar(`${criado.nome} foi cadastrado(a) como ${NOMES_PERFIL[criado.perfil]}. Entregue a senha inicial e peça para trocá-la em "Minha conta".`);
    } catch (erro) {
      // Ex.: 409 "Já existe um usuário com este e-mail."
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-cadastro">
      <h2 id="titulo-cadastro">Cadastrar usuário</h2>
      <p>
        Só a coordenação cadastra contas. Como o sistema guarda dados de crianças (LGPD), não existe cadastro
        aberto na tela de login.
      </p>

      <form id="form-cadastro" noValidate onSubmit={lidarComEnvio}>
        <MensagemFormulario id="mensagem-cadastro" mensagem={mensagem} />

        <div>
          <label htmlFor="campo-nome">Nome completo</label>
          <input
            type="text"
            id="campo-nome"
            name="nome"
            autoComplete="off"
            maxLength={150}
            value={campos.nome}
            onChange={lidarComMudanca}
            aria-invalid={erros.nome ? 'true' : undefined}
            aria-describedby="erro-nome"
          />
          <span id="erro-nome">{erros.nome}</span>
        </div>

        <div>
          <label htmlFor="campo-email">E-mail (será o login)</label>
          <input
            type="email"
            id="campo-email"
            name="email"
            autoComplete="off"
            maxLength={150}
            value={campos.email}
            onChange={lidarComMudanca}
            aria-invalid={erros.email ? 'true' : undefined}
            aria-describedby="erro-email"
          />
          <span id="erro-email">{erros.email}</span>
        </div>

        <div>
          <label htmlFor="campo-perfil">Perfil</label>
          <select
            id="campo-perfil"
            name="perfil"
            value={campos.perfil}
            onChange={lidarComMudanca}
            aria-invalid={erros.perfil ? 'true' : undefined}
            aria-describedby="erro-perfil"
          >
            <option value="">Selecione</option>
            <option value="responsavel">Responsável</option>
            <option value="professor">Professor(a)</option>
            <option value="administrador">Administrador</option>
          </select>
          <span id="erro-perfil">{erros.perfil}</span>
        </div>

        {/* Os alunos só aparecem para o perfil responsável: é o vínculo
            aluno_responsavel que libera os relatórios (RF08). */}
        {campos.perfil === 'responsavel' && (
          <fieldset>
            <legend>Alunos vinculados (opcional)</legend>
            <div id="lista-vinculos">
              {alunos.carregando && <p>Carregando...</p>}
              {alunos.erro && <p>{alunos.erro}</p>}
              {alunos.dados?.map((aluno) => (
                <div key={aluno.id}>
                  <input
                    type="checkbox"
                    id={`vinculo-${aluno.id}`}
                    checked={alunosMarcados.includes(aluno.id)}
                    onChange={() => alternarAluno(aluno.id)}
                  />
                  <label htmlFor={`vinculo-${aluno.id}`}>
                    {aluno.nome}
                    {aluno.turma ? ` (${aluno.turma})` : ''}
                  </label>
                </div>
              ))}
            </div>
            <small>O responsável só verá os relatórios publicados dos alunos marcados aqui.</small>
          </fieldset>
        )}

        <div>
          <label htmlFor="campo-senha">Senha inicial</label>
          <input
            type="password"
            id="campo-senha"
            name="senha"
            autoComplete="new-password"
            value={campos.senha}
            onChange={lidarComMudanca}
            aria-invalid={erros.senha ? 'true' : undefined}
            aria-describedby="regras-senha-cadastro erro-senha"
          />
          <small id="regras-senha-cadastro">{regra.texto}</small>
          <span id="erro-senha">{erros.senha}</span>
        </div>

        <div>
          <label htmlFor="campo-confirmacao">Confirme a senha inicial</label>
          <input
            type="password"
            id="campo-confirmacao"
            name="confirmacao"
            autoComplete="new-password"
            value={campos.confirmacao}
            onChange={lidarComMudanca}
            aria-invalid={erros.confirmacao ? 'true' : undefined}
            aria-describedby="erro-confirmacao"
          />
          <span id="erro-confirmacao">{erros.confirmacao}</span>
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Cadastrando...' : 'Cadastrar usuário'}
        </button>
      </form>
    </section>
  );
}

// ------------------------------------------------------------
// Uma linha da tabela, com o botão Ativar/Inativar.
// ------------------------------------------------------------
function LinhaUsuario({ usuario, ehVoceMesmo, aoMudar }) {
  const { token } = useAutenticacao();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  async function lidarComClique() {
    // Inativar tira o acesso da pessoa: vale confirmar antes
    // (heurística 3 de Nielsen - prevenir ação por engano).
    if (usuario.ativo && !window.confirm(`Inativar ${usuario.nome}? A pessoa não conseguirá mais entrar no sistema.`)) {
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      await mudarAtivo(usuario.id, !usuario.ativo, token);
      aoMudar(`${usuario.nome} agora está ${usuario.ativo ? 'inativo(a)' : 'ativo(a)'}.`);
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  return (
    <tr>
      <td>{usuario.nome}</td>
      <td>{usuario.email}</td>
      <td>{NOMES_PERFIL[usuario.perfil]}</td>
      <td>{usuario.perfil === 'responsavel' ? usuario.alunos || 'Nenhum' : '-'}</td>
      <td>
        {/* A cor sempre acompanha o texto (acessibilidade). */}
        <span className={`status status--${usuario.ativo ? 'publicado' : 'cancelado'}`}>
          {usuario.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td>
        {ehVoceMesmo ? (
          <small>Sua conta</small>
        ) : (
          <button type="button" className="botao-secundario" onClick={lidarComClique} disabled={salvando}>
            {salvando ? 'Salvando...' : usuario.ativo ? 'Inativar' : 'Ativar'}
          </button>
        )}
        {/* span[id^="erro-"] já fica vermelho pelo CSS do guia de estilo */}
        {erro && <span id={`erro-ativo-${usuario.id}`}>{erro}</span>}
      </td>
    </tr>
  );
}

// ------------------------------------------------------------
// A página: junta o formulário e a tabela.
// ------------------------------------------------------------
function AdminUsuarios() {
  const { usuario: eu, token } = useAutenticacao();
  const [perfil, setPerfil] = useState('');
  const [pagina, setPagina] = useState(1);
  const [aviso, setAviso] = useState(null);

  // Rebusca sempre que o filtro ou a página mudam.
  const lista = useBusca(() => buscarUsuarios({ perfil, pagina }, token), [token, perfil, pagina]);

  // Depois de cadastrar ou ativar/inativar: mostra o aviso e
  // recarrega a tabela para ela refletir o banco.
  function aposMudanca(texto) {
    setAviso(texto);
    lista.recarregar();
  }

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/admin' }, { texto: 'Usuários' }]} />
      <h1>Usuários</h1>

      {aviso && <div role="alert" className="sucesso">{aviso}</div>}

      <FormularioCadastro aoCadastrar={aposMudanca} />

      <section aria-labelledby="titulo-usuarios">
        <h2 id="titulo-usuarios">Usuários cadastrados</h2>

        <form role="search" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="filtro-perfil">Perfil</label>
            <select
              id="filtro-perfil"
              value={perfil}
              onChange={(e) => {
                setPerfil(e.target.value);
                setPagina(1); // filtro novo começa da primeira página
              }}
            >
              <option value="">Todos</option>
              <option value="responsavel">Responsáveis</option>
              <option value="professor">Professores</option>
              <option value="administrador">Administradores</option>
            </select>
          </div>
        </form>

        {lista.dados && <p id="resumo-usuarios">{contar(lista.dados.total, 'usuário encontrado', 'usuários encontrados')}</p>}

        <table>
          <caption>Usuários do sistema</caption>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">E-mail</th>
              <th scope="col">Perfil</th>
              <th scope="col">Alunos vinculados</th>
              <th scope="col">Situação</th>
              <th scope="col">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.carregando && <LinhaMensagem colunas={COLUNAS} texto="Carregando..." />}
            {lista.erro && <LinhaMensagem colunas={COLUNAS} texto={lista.erro} erro />}
            {!lista.carregando && !lista.erro && lista.dados.usuarios.length === 0 && (
              <LinhaMensagem colunas={COLUNAS} texto="Nenhum usuário encontrado. Tente outro perfil." />
            )}
            {!lista.carregando &&
              !lista.erro &&
              lista.dados.usuarios.map((u) => (
                <LinhaUsuario key={u.id} usuario={u} ehVoceMesmo={u.id === eu.id} aoMudar={aposMudanca} />
              ))}
          </tbody>
        </table>

        {lista.dados && (
          <Paginacao
            rotulo="dos usuários"
            pagina={lista.dados.pagina}
            totalPaginas={lista.dados.totalPaginas}
            aoMudar={setPagina}
            desabilitado={lista.carregando}
          />
        )}
      </section>
    </main>
  );
}

export default AdminUsuarios;
