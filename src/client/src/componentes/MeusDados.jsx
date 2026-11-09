// ============================================================
// componentes/MeusDados.jsx
// Seção "Meus dados" (nome e e-mail) das três contas.
// O texto de "como corrigir" muda por perfil e vem pela prop.
// ============================================================
import { useAutenticacao } from '../contextos/AutenticacaoContexto';
import { buscarConta } from '../servicos/servicoConta';
import { useBusca } from '../utilitarios/useBusca';

function MeusDados({ comoCorrigir }) {
  const { token } = useAutenticacao();
  const { dados: conta, carregando, erro } = useBusca(() => buscarConta(token), [token]);

  // Enquanto carrega: "Carregando..."; com erro: a mensagem.
  const valor = (campo) => (carregando ? 'Carregando...' : erro ? '-' : conta[campo]);

  return (
    <section aria-labelledby="titulo-dados">
      <h2 id="titulo-dados">Meus dados</h2>
      {erro && <p role="status" className="erro">{erro}</p>}
      <dl>
        <div>
          <dt>Nome</dt>
          <dd id="conta-nome">{valor('nome')}</dd>
        </div>
        <div>
          <dt>E-mail</dt>
          <dd id="conta-email">{valor('email')}</dd>
        </div>
      </dl>
      <p>{comoCorrigir}</p>
    </section>
  );
}

export default MeusDados;
