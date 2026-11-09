// ============================================================
// paginas/admin/AdminConta.jsx  (tela 5 do administrador)
// ============================================================
import Trilha from '../../componentes/Trilha';
import MeusDados from '../../componentes/MeusDados';
import FormularioSenha from '../../componentes/FormularioSenha';

function AdminConta() {
  return (
    <main>
      <Trilha itens={[{ texto: 'Início', para: '/admin' }, { texto: 'Minha conta' }]} />
      <h1>Minha conta</h1>

      <MeusDados comoCorrigir="Para corrigir seu nome ou e-mail, peça a outro administrador da escola." />

      <section aria-labelledby="titulo-acesso">
        <h2 id="titulo-acesso">Nível de acesso</h2>
        <p>Seu perfil é <strong>Administrador</strong>. Com ele você pode:</p>
        <ul>
          <li>cadastrar e manter alunos, responsáveis, professores, turmas, disciplinas e tags;</li>
          <li>definir os períodos de digitação dos bimestres;</li>
          <li>revisar, alterar, devolver, cancelar e publicar acompanhamentos;</li>
          <li>consultar relatórios e exportar dados autorizados.</li>
        </ul>
      </section>

      {/* A regra de senha do admin é mais forte (12 caracteres +
          símbolo) porque esta conta vê os dados de TODOS os alunos. */}
      <FormularioSenha />
      <p>
        Por que a senha do administrador é mais exigente? Esta conta acessa os dados de todos os alunos da escola; uma
        senha mais forte diminui o risco de vazamento.
      </p>

      <section aria-labelledby="titulo-privacidade">
        <h2 id="titulo-privacidade">Privacidade e responsabilidades</h2>
        <p>Como administrador, você tem acesso aos dados de todos os alunos, que a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) protege de forma especial por serem crianças. Por isso:</p>
        <ul>
          <li><strong>Tudo é registrado:</strong> alterações, devoluções e publicações ficam no histórico, com seu nome, data e hora.</li>
          <li><strong>Menor privilégio:</strong> ao cadastrar professores e responsáveis, vincule cada um apenas às turmas e aos alunos necessários.</li>
          <li><strong>Exportações:</strong> exporte somente os dados necessários e não os compartilhe fora da escola.</li>
          <li><strong>Pedidos das famílias:</strong> solicitações de consulta, correção ou exclusão de dados devem ser atendidas e registradas.</li>
          <li><strong>Sessão:</strong> em computadores compartilhados, use sempre o botão &quot;Sair&quot; ao terminar.</li>
        </ul>
      </section>
    </main>
  );
}

export default AdminConta;
