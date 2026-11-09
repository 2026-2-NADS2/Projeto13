// ============================================================
// paginas/Login.jsx
// O login.js da Entrega 1 reescrito em React. Mesma lógica:
//   1. valida e-mail e senha ANTES de chamar a API;
//   2. durante o envio, trava o botão e mostra "Entrando...";
//   3. sucesso: guarda usuário + token (Context) e vai para o
//      início do perfil; erro: mostra a mensagem da API.
// A diferença: em vez de procurar elementos com getElementById e
// mudar o texto, guardamos tudo em ESTADO e o JSX desenha a tela
// de acordo com ele (forma declarativa).
// ============================================================
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAutenticacao, INICIO_DO_PERFIL } from '../contextos/AutenticacaoContexto';
import { entrar } from '../servicos/servicoConta';
import { FORMATO_EMAIL } from '../utilitarios/validacao';
import Rodape from '../componentes/Rodape';

function Login() {
  const { usuario, aviso, entrar: guardarLogin } = useAutenticacao();
  const navegar = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});           // { email: '...', senha: '...' }
  const [mensagemGeral, setMensagemGeral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Já está logado? Não faz sentido ver o login: vai para o início.
  if (usuario) {
    return <Navigate to={INICIO_DO_PERFIL[usuario.perfil]} replace />;
  }

  function validar() {
    const novosErros = {};
    const emailLimpo = email.trim();
    if (emailLimpo === '') novosErros.email = 'Informe seu e-mail.';
    else if (!FORMATO_EMAIL.test(emailLimpo)) novosErros.email = 'Digite um e-mail válido, como nome@exemplo.com.';
    // A senha NÃO leva trim: espaços podem fazer parte dela.
    if (senha === '') novosErros.senha = 'Informe sua senha.';
    setErros(novosErros);

    // Leva o foco para o primeiro campo com erro (ajuda quem usa
    // teclado ou leitor de tela).
    if (novosErros.email) document.getElementById('email').focus();
    else if (novosErros.senha) document.getElementById('senha').focus();

    return Object.keys(novosErros).length === 0;
  }

  async function lidarComEnvio(evento) {
    evento.preventDefault(); // sem isto, o navegador recarregaria a página
    setMensagemGeral(null);
    if (!validar()) return;

    setEnviando(true);
    try {
      const resposta = await entrar(email.trim(), senha);
      guardarLogin(resposta.usuario, resposta.token);
      navegar(INICIO_DO_PERFIL[resposta.usuario.perfil], { replace: true });
    } catch (erro) {
      setMensagemGeral(erro.message);
      setEnviando(false);
    }
  }

  return (
    <>
      <main>
        <header>
          <h1>KFKA</h1>
          <p>Plataforma de Acompanhamento Escolar</p>
        </header>

        {/* noValidate desliga os balões do navegador: quem mostra os
            erros somos nós, embaixo de cada campo. */}
        <form id="form-login" noValidate onSubmit={lidarComEnvio}>
          <h2>Entrar</h2>

          {/* Aviso de sessão expirada OU erro do login. */}
          {(mensagemGeral || aviso) && (
            <div id="mensagem-geral" role="alert">
              {mensagemGeral || aviso}
            </div>
          )}

          <div className="campo">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={erros.email ? 'true' : undefined}
              aria-describedby="erro-email"
            />
            <span id="erro-email">{erros.email}</span>
          </div>

          <div className="campo">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              autoComplete="current-password"
              placeholder="sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={erros.senha ? 'true' : undefined}
              aria-describedby="erro-senha"
            />
            <span id="erro-senha">{erros.senha}</span>
          </div>

          <button type="submit" id="botao-entrar" disabled={enviando}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </button>

          <small>Esqueceu a senha? Peça uma nova à secretaria da escola.</small>
        </form>
      </main>
      <Rodape />
    </>
  );
}

export default Login;
