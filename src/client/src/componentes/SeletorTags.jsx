// ============================================================
// componentes/SeletorTags.jsx
// Os checkboxes de "Pontos observados" (tags), usados pelo
// professor e pelo admin. Formulário controlado: quais tags estão
// marcadas fica no estado do PAI (selecionadas), e este componente
// só avisa as mudanças por aoMudar(novaLista).
// ============================================================
function SeletorTags({ tags, selecionadas, aoMudar, desabilitado = false, carregando, erro }) {
  // Marca/desmarca sem alterar o array antigo (imutabilidade,
  // capítulo 7): cria uma lista nova com ou sem o id.
  function alternar(id) {
    if (selecionadas.includes(id)) {
      aoMudar(selecionadas.filter((t) => t !== id));
    } else {
      aoMudar([...selecionadas, id]);
    }
  }

  return (
    <fieldset>
      <legend>Pontos observados (marque quantos quiser)</legend>
      <div id="lista-tags">
        {carregando && <p>Carregando...</p>}
        {erro && <p>{erro}</p>}
        {tags?.map((tag) => (
          <div key={tag.id}>
            <input
              type="checkbox"
              id={`tag-${tag.id}`}
              checked={selecionadas.includes(tag.id)}
              onChange={() => alternar(tag.id)}
              disabled={desabilitado}
            />
            <label htmlFor={`tag-${tag.id}`}>{tag.nome}</label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export default SeletorTags;
