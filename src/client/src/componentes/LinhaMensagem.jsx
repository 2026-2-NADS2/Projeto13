// ============================================================
// componentes/LinhaMensagem.jsx
// Uma linha de tabela que ocupa todas as colunas, para os estados
// "Carregando...", "Nenhum resultado" e mensagens de erro.
// Com erro = true, ganha a classe "erro" (texto vermelho no CSS).
// ============================================================
function LinhaMensagem({ colunas, texto, erro = false }) {
  return (
    <tr>
      <td colSpan={colunas} className={erro ? 'erro' : undefined}>
        {texto}
      </td>
    </tr>
  );
}

export default LinhaMensagem;
