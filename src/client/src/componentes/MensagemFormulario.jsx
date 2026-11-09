// ============================================================
// componentes/MensagemFormulario.jsx
// A caixa de mensagem geral de um formulário (sucesso ou erro).
// mensagem = { tipo: 'erro' | 'sucesso', texto } ou null.
// role="alert": o leitor de tela lê assim que aparece.
// Com mensagem null, o componente não desenha nada (retorno
// antecipado, capítulo 6) - é o "hidden" da Entrega 1.
// ============================================================
function MensagemFormulario({ id, mensagem }) {
  if (!mensagem) return null;
  return (
    <div id={id} role="alert" className={mensagem.tipo === 'sucesso' ? 'sucesso' : undefined}>
      {mensagem.texto}
    </div>
  );
}

export default MensagemFormulario;
