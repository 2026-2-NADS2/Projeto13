// ============================================================
// componentes/Trilha.jsx
// Trilha de navegação (breadcrumb): Início › Relatórios › Detalhe.
// Recebe uma lista de itens; o ÚLTIMO é a página atual (sem link).
//
//   <Trilha itens={[
//     { texto: 'Início', para: '/responsavel' },
//     { texto: 'Relatórios' },
//   ]} />
// ============================================================
import { Link } from 'react-router-dom';

function Trilha({ itens }) {
  return (
    <nav aria-label="Você está em">
      <ol>
        {itens.map((item, indice) => {
          const ultimo = indice === itens.length - 1;
          // A lista é fixa (não muda de ordem), por isso o índice
          // serve como key aqui.
          return ultimo ? (
            <li key={indice} aria-current="page">{item.texto}</li>
          ) : (
            <li key={indice}>
              <Link to={item.para}>{item.texto}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Trilha;
