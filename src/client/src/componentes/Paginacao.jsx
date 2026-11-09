// ============================================================
// componentes/Paginacao.jsx
// Anterior | Página 1 de 2 | Próxima
// Não guarda estado: recebe a página atual e avisa o pai quando o
// usuário quer mudar (aoMudar), como no capítulo 11 ("filho avisa
// o pai"). Quem busca a nova página é a página que usa o componente.
// ============================================================
function Paginacao({ rotulo, pagina, totalPaginas, aoMudar, desabilitado = false }) {
  return (
    <nav aria-label={`Paginação ${rotulo}`}>
      <button type="button" id="pagina-anterior" onClick={() => aoMudar(pagina - 1)} disabled={desabilitado || pagina <= 1}>
        Anterior
      </button>
      <span id="pagina-atual">
        Página {pagina} de {totalPaginas}
      </span>
      <button type="button" id="pagina-proxima" onClick={() => aoMudar(pagina + 1)} disabled={desabilitado || pagina >= totalPaginas}>
        Próxima
      </button>
    </nav>
  );
}

export default Paginacao;
