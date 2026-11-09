// ============================================================
// paginas/responsavel/ResponsavelConta.jsx  (tela 4 de 4)
// Meus dados, alunos vinculados, troca de senha e privacidade.
// ============================================================
import { useAutenticacao } from '../../contextos/AutenticacaoContexto';
import { buscarMeusAlunos } from '../../servicos/servicoResponsavel';
import { useBusca } from '../../utilitarios/useBusca';
import Trilha from '../../componentes/Trilha';
import MeusDados from '../../componentes/MeusDados';
import FormularioSenha from '../../componentes/FormularioSenha';

function ResponsavelConta() {
  const { token } = useAutenticacao();
  const alunos = useBusca(() => buscarMeusAlunos(token), [token]);

  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/responsavel' }, { texto: 'Minha conta' }]} />
      <h1>Minha conta</h1>

      <MeusDados comoCorrigir="Para corrigir seu nome ou e-mail, entre em contato com a secretaria da escola." />

      <section aria-labelledby="titulo-vinculos">
        <h2 id="titulo-vinculos">Alunos vinculados</h2>
        <ul id="conta-alunos">
          {alunos.carregando && <li>Carregando...</li>}
          {alunos.erro && <li>{alunos.erro}</li>}
          {alunos.dados?.length === 0 && <li>Nenhum aluno vinculado.</li>}
          {!alunos.carregando &&
            alunos.dados?.map((a) => (
              <li key={a.id}>
                <strong>{a.nome}</strong>
                <span>{a.turma ?? 'Sem turma'}</span>
              </li>
            ))}
        </ul>
        <p>Algum aluno está faltando ou aparece por engano? Avise a secretaria da escola.</p>
      </section>

      <FormularioSenha />

      <section aria-labelledby="titulo-privacidade">
        <h2 id="titulo-privacidade">Privacidade e seus dados</h2>
        <p>A KFKA guarda apenas os dados necessários para o acompanhamento escolar:</p>
        <ul>
          <li><strong>Seus dados:</strong> nome e e-mail, usados para acessar o sistema e identificar você como responsável.</li>
          <li><strong>Dados dos alunos:</strong> nome, turma, médias e relatórios de acompanhamento, usados para informar a família sobre o desenvolvimento escolar.</li>
          <li><strong>Quem acessa:</strong> você vê apenas os alunos vinculados à sua conta; professores veem apenas as próprias turmas; a coordenação da escola revisa e publica os relatórios.</li>
          <li><strong>Seus direitos:</strong> você pode pedir à escola a consulta, a correção ou a exclusão dos seus dados, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</li>
        </ul>
      </section>
    </main>
  );
}

export default ResponsavelConta;
