// ============================================================
// componentes/FormularioSenha.jsx
// "Alterar senha", igual nas três contas. Só muda a regra (o admin
// precisa de senha mais forte), que vem do perfil do usuário logado.
//
// Formulário CONTROLADO (capítulo 9): cada campo tem value + onChange,
// e o React guarda o que foi digitado. No envio, preventDefault()
// impede o navegador de recarregar a página e de colocar as senhas
// na barra de endereço (problema encontrado na análise de
// usabilidade da Entrega 1).
// ============================================================
import { useState } from 'react';
import { useAutenticacao } from '../contextos/AutenticacaoContexto';
import { trocarSenha } from '../servicos/servicoConta';
import { regrasDoPerfil } from '../utilitarios/validacao';
import MensagemFormulario from './MensagemFormulario';

const CAMPOS_VAZIOS = { atual: '', nova: '', confirmacao: '' };

function FormularioSenha() {
  const { usuario, token } = useAutenticacao();
  const regra = regrasDoPerfil(usuario.perfil);

  const [campos, setCampos] = useState(CAMPOS_VAZIOS);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Um único onChange para os três campos: o "name" do input diz
  // qual propriedade do objeto atualizar ([nome]: valor).
  function lidarComMudanca(evento) {
    const { name, value } = evento.target;
    setCampos((atual) => ({ ...atual, [name]: value }));
  }

  function validar() {
    const novosErros = {};
    if (!campos.atual) novosErros.atual = 'Informe sua senha atual.';
    if (!campos.nova) novosErros.nova = 'Informe a nova senha.';
    else if (!regra.valida(campos.nova)) novosErros.nova = 'A nova senha não segue as regras acima.';
    else if (campos.nova === campos.atual) novosErros.nova = 'A nova senha precisa ser diferente da atual.';
    if (!campos.confirmacao) novosErros.confirmacao = 'Confirme a nova senha.';
    else if (campos.confirmacao !== campos.nova) novosErros.confirmacao = 'As senhas não são iguais.';
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault();
    setMensagem(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      const resposta = await trocarSenha(campos.atual, campos.nova, token);
      setMensagem({ tipo: 'sucesso', texto: resposta.mensagem });
      setCampos(CAMPOS_VAZIOS);
    } catch (erro) {
      setMensagem({ tipo: 'erro', texto: erro.message });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section aria-labelledby="titulo-senha">
      <h2 id="titulo-senha">Alterar senha</h2>

      <form id="form-senha" noValidate onSubmit={lidarComEnvio}>
        <MensagemFormulario id="mensagem-senha" mensagem={mensagem} />

        <div>
          <label htmlFor="senha-atual">Senha atual</label>
          <input
            type="password"
            id="senha-atual"
            name="atual"
            autoComplete="current-password"
            value={campos.atual}
            onChange={lidarComMudanca}
            aria-invalid={erros.atual ? 'true' : undefined}
            aria-describedby="erro-senha-atual"
          />
          <span id="erro-senha-atual">{erros.atual}</span>
        </div>

        <div>
          <label htmlFor="senha-nova">Nova senha</label>
          <input
            type="password"
            id="senha-nova"
            name="nova"
            autoComplete="new-password"
            value={campos.nova}
            onChange={lidarComMudanca}
            aria-invalid={erros.nova ? 'true' : undefined}
            aria-describedby="regras-senha erro-senha-nova"
          />
          <small id="regras-senha">{regra.texto}</small>
          <span id="erro-senha-nova">{erros.nova}</span>
        </div>

        <div>
          <label htmlFor="senha-confirmacao">Confirme a nova senha</label>
          <input
            type="password"
            id="senha-confirmacao"
            name="confirmacao"
            autoComplete="new-password"
            value={campos.confirmacao}
            onChange={lidarComMudanca}
            aria-invalid={erros.confirmacao ? 'true' : undefined}
            aria-describedby="erro-senha-confirmacao"
          />
          <span id="erro-senha-confirmacao">{erros.confirmacao}</span>
        </div>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Salvando...' : 'Salvar nova senha'}
        </button>
      </form>
    </section>
  );
}

export default FormularioSenha;
