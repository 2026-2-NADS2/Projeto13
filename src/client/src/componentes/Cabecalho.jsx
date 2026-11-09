// ============================================================
// componentes/Cabecalho.jsx
// A faixa azul do topo: logo, menu do perfil, nome e botão Sair.
// Na Entrega 1 este HTML era copiado em 14 páginas; agora é UM
// componente que muda o menu conforme o perfil de quem está logado.
// ============================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../contextos/AutenticacaoContexto';

// Itens do menu de cada perfil. "fim: true" faz o link de Início
// ficar marcado SÓ em "/responsavel", e não em "/responsavel/conta".
const MENUS = {
  responsavel: [
    { para: '/responsavel', texto: 'Início', fim: true },
    { para: '/responsavel/relatorios', texto: 'Relatórios' },
    { para: '/responsavel/conta', texto: 'Minha conta' },
  ],
  professor: [
    { para: '/professor', texto: 'Início', fim: true },
    { para: '/professor/turmas', texto: 'Minhas turmas' },
    { para: '/professor/acompanhamento', texto: 'Registrar acompanhamento', fim: true },
    { para: '/professor/conta', texto: 'Minha conta' },
  ],
  administrador: [
    { para: '/admin', texto: 'Início', fim: true },
    { para: '/admin/revisao', texto: 'Revisão' },
    { para: '/admin/periodos', texto: 'Períodos' },
    { para: '/admin/usuarios', texto: 'Usuários' },
    { para: '/admin/conta', texto: 'Minha conta' },
  ],
};

function Cabecalho() {
  const { usuario, sair } = useAutenticacao();
  const navegar = useNavigate();

  function lidarComSair() {
    sair();
    navegar('/login'); // useNavigate: navegar pelo código (capítulo 12)
  }

  return (
    <header>
      <p>KFKA</p>

      <nav aria-label="Menu principal">
        <ul>
          {MENUS[usuario.perfil].map((item) => (
            <li key={item.para}>
              {/* NavLink é um Link que sabe se está "ativo". Quando a
                  URL bate, ele coloca aria-current="page" sozinho, e o
                  CSS da Entrega 1 já pinta esse item (barra amarela). */}
              <NavLink to={item.para} end={item.fim}>
                {item.texto}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        <span id="nome-usuario">{usuario.nome}</span>
        <button type="button" id="botao-sair" onClick={lidarComSair}>
          Sair
        </button>
      </div>
    </header>
  );
}

export default Cabecalho;
