// ============================================================
// paginas/professor/ProfessorConta.jsx  (tela 4 do professor)
// ============================================================
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarMinhasTurmas } from '../../servicos/servicoProfessor';
import { useBusca } from '../../utilitarios/useBusca';
import Trilha from '../../componentes/Trilha';
import MeusDados from '../../componentes/MeusDados';
import FormularioSenha from '../../componentes/FormularioSenha';

function ProfessorConta() {
  const { token } = useAutenticacao();
  const turmas = useBusca(() => buscarMinhasTurmas(token), [token]);

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/professor' }, { texto: 'Minha conta' }]} />
      <h1>Minha conta</h1>

      <MeusDados comoCorrigir="Para corrigir seu nome ou e-mail, entre em contato com a coordenação da escola." />

      <section aria-labelledby="titulo-vinculos">
        <h2 id="titulo-vinculos">Turmas e disciplinas vinculadas</h2>
        <ul id="conta-turmas">
          {turmas.carregando && <li>Carregando...</li>}
          {turmas.erro && <li>{turmas.erro}</li>}
          {turmas.dados?.length === 0 && <li>Nenhuma turma vinculada.</li>}
          {!turmas.carregando &&
            turmas.dados?.map((t) => (
              <li key={`${t.turmaId}-${t.disciplinaId}`}>
                <strong>{t.turma}</strong>
                <span>{t.disciplina} · {t.anoLetivo}</span>
              </li>
            ))}
        </ul>
        <p>Alguma turma está faltando ou aparece por engano? Avise a coordenação da escola.</p>
      </section>

      <FormularioSenha />

      <section aria-labelledby="titulo-privacidade">
        <h2 id="titulo-privacidade">Privacidade e uso dos dados dos alunos</h2>
        <p>Você tem acesso a dados de crianças, que a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) protege de forma especial. Ao usar a KFKA:</p>
        <ul>
          <li><strong>Acesso restrito:</strong> você vê apenas os alunos das turmas vinculadas a você.</li>
          <li><strong>Finalidade:</strong> use os dados somente para o acompanhamento escolar; não os copie para planilhas, aplicativos de mensagem ou outros sistemas.</li>
          <li><strong>Registro mínimo:</strong> nos acompanhamentos, descreva o desenvolvimento escolar e evite informações pessoais, familiares ou de saúde que não sejam necessárias.</li>
          <li><strong>Rastreabilidade:</strong> os registros e as alterações ficam gravados no histórico do sistema, com autor e data.</li>
          <li><strong>Sessão:</strong> em computadores compartilhados, use sempre o botão &quot;Sair&quot; ao terminar.</li>
        </ul>
      </section>
    </main>
  );
}

export default ProfessorConta;
