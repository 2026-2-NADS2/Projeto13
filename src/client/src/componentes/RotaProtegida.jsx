// ============================================================
// componentes/RotaProtegida.jsx
// "Moldura" das páginas internas. Recebe a página como children
// (capítulo 5) e:
//   1. sem login        -> manda para /login;
//   2. perfil diferente -> manda para o início do próprio perfil;
//   3. tudo certo       -> desenha Cabeçalho + página + Rodapé.
//
// Uso no App.jsx:
//   <RotaProtegida perfil="responsavel"><ResponsavelInicio /></RotaProtegida>
//
// Lembrete: isto é conforto de uso, não segurança. Mesmo que alguém
// burle esta tela, a API responde 401/403 e nenhum dado aparece.
// ============================================================
import { Navigate } from 'react-router-dom';
import { useAutenticacao, INICIO_DO_PERFIL } from '../contextos/AutenticacaoContexto';
import Cabecalho from './Cabecalho';
import Rodape from './Rodape';

function RotaProtegida({ perfil, children }) {
  const { usuario } = useAutenticacao();

  // <Navigate> é a versão em componente do useNavigate: ao ser
  // desenhado, troca a URL. "replace" não deixa a tela proibida no
  // histórico (o botão Voltar não volta para ela).
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }
  if (usuario.perfil !== perfil) {
    return <Navigate to={INICIO_DO_PERFIL[usuario.perfil]} replace />;
  }

  return (
    <>
      <Cabecalho />
      {children}
      <Rodape />
    </>
  );
}

export default RotaProtegida;
