// ============================================================
// paginas/NaoEncontrada.jsx
// A antiga 404.html. Aparece em duas situações (capítulo 12):
//   1. a ROTA não existe (/qualquer-coisa) -> rota "*" do App.jsx;
//   2. a rota existe, mas o REGISTRO não -> a página decide.
// Sem cabeçalho de menu: o CSS reconhece isso e centraliza tudo.
// ============================================================
import { Link } from 'react-router-dom';
import { useAutenticacao, INICIO_DO_PERFIL } from '../contextos/AutenticacaoContexto';
import Rodape from '../componentes/Rodape';

function NaoEncontrada() {
  const { usuario } = useAutenticacao();
  const destino = usuario ? INICIO_DO_PERFIL[usuario.perfil] : '/login';

  return (
    <>
      <main>
        <p>KFKA</p>
        <p>Erro 404</p>
        <h1>Página não encontrada</h1>
        <p>O endereço que você tentou acessar não existe ou foi alterado. Confira se ele foi digitado corretamente.</p>
        <p>
          <Link to={destino}>Voltar para o início</Link>
        </p>
      </main>
      <Rodape />
    </>
  );
}

export default NaoEncontrada;
