// ============================================================
// App.jsx - o "mapa" do site (React Router, aula 08).
//
// Na Entrega 1 cada tela era um arquivo .html separado. Agora há UM
// index.html, e o React Router escolhe qual componente desenhar
// olhando a URL. Trocar de tela não recarrega a página.
//
// As rotas internas ficam dentro de <RotaProtegida perfil="...">,
// que confere o login e coloca o cabeçalho e o rodapé.
//
//   Responsável (4 telas)        Professor (4 telas)
//   /responsavel                 /professor
//   /responsavel/relatorios      /professor/turmas
//   /responsavel/relatorios/:id  /professor/acompanhamento     (novo)
//   /responsavel/conta           /professor/acompanhamento/:id (editar)
//                                /professor/conta
//   Administrador (6 telas)
//   /admin                       /admin/periodos
//   /admin/revisao               /admin/usuarios  (cadastro)
//   /admin/revisao/:id           /admin/conta
// ============================================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AutenticacaoProvider, useAutenticacao, INICIO_DO_PERFIL } from './contextos/AutenticacaoContexto';
import RotaProtegida from './componentes/RotaProtegida';

import Login from './paginas/Login';
import NaoEncontrada from './paginas/NaoEncontrada';

import ResponsavelInicio from './paginas/responsavel/ResponsavelInicio';
import ResponsavelRelatorios from './paginas/responsavel/ResponsavelRelatorios';
import ResponsavelRelatorio from './paginas/responsavel/ResponsavelRelatorio';
import ResponsavelConta from './paginas/responsavel/ResponsavelConta';

import ProfessorInicio from './paginas/professor/ProfessorInicio';
import ProfessorTurmas from './paginas/professor/ProfessorTurmas';
import ProfessorAcompanhamento from './paginas/professor/ProfessorAcompanhamento';
import ProfessorConta from './paginas/professor/ProfessorConta';

import AdminInicio from './paginas/admin/AdminInicio';
import AdminRevisao from './paginas/admin/AdminRevisao';
import AdminRevisar from './paginas/admin/AdminRevisar';
import AdminPeriodos from './paginas/admin/AdminPeriodos';
import AdminUsuarios from './paginas/admin/AdminUsuarios';
import AdminConta from './paginas/admin/AdminConta';

// "/" leva para o início do perfil (se logado) ou para o login.
function Raiz() {
  const { usuario } = useAutenticacao();
  return <Navigate to={usuario ? INICIO_DO_PERFIL[usuario.perfil] : '/login'} replace />;
}

function App() {
  return (
    // O Provider fica por fora de tudo: qualquer tela pode ler o login.
    <AutenticacaoProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Raiz />} />
          <Route path="/login" element={<Login />} />

          {/* ---------- Responsável ---------- */}
          <Route path="/responsavel" element={<RotaProtegida perfil="responsavel"><ResponsavelInicio /></RotaProtegida>} />
          <Route path="/responsavel/relatorios" element={<RotaProtegida perfil="responsavel"><ResponsavelRelatorios /></RotaProtegida>} />
          {/* ":id" é um parâmetro: a página lê com useParams() */}
          <Route path="/responsavel/relatorios/:id" element={<RotaProtegida perfil="responsavel"><ResponsavelRelatorio /></RotaProtegida>} />
          <Route path="/responsavel/conta" element={<RotaProtegida perfil="responsavel"><ResponsavelConta /></RotaProtegida>} />

          {/* ---------- Professor ---------- */}
          <Route path="/professor" element={<RotaProtegida perfil="professor"><ProfessorInicio /></RotaProtegida>} />
          <Route path="/professor/turmas" element={<RotaProtegida perfil="professor"><ProfessorTurmas /></RotaProtegida>} />
          {/* As duas rotas usam a MESMA página. A "key" diferente faz o React
              criar a página do zero ao passar de "novo" para "/15" (depois de
              salvar); sem ela, o React reaproveitaria a tela antiga e o estado
              (como a mensagem de sucesso) não seria reiniciado. */}
          <Route path="/professor/acompanhamento" element={<RotaProtegida perfil="professor"><ProfessorAcompanhamento key="novo" /></RotaProtegida>} />
          <Route path="/professor/acompanhamento/:id" element={<RotaProtegida perfil="professor"><ProfessorAcompanhamento key="editar" /></RotaProtegida>} />
          <Route path="/professor/conta" element={<RotaProtegida perfil="professor"><ProfessorConta /></RotaProtegida>} />

          {/* ---------- Administrador ---------- */}
          <Route path="/admin" element={<RotaProtegida perfil="administrador"><AdminInicio /></RotaProtegida>} />
          <Route path="/admin/revisao" element={<RotaProtegida perfil="administrador"><AdminRevisao /></RotaProtegida>} />
          <Route path="/admin/revisao/:id" element={<RotaProtegida perfil="administrador"><AdminRevisar /></RotaProtegida>} />
          <Route path="/admin/periodos" element={<RotaProtegida perfil="administrador"><AdminPeriodos /></RotaProtegida>} />
          <Route path="/admin/usuarios" element={<RotaProtegida perfil="administrador"><AdminUsuarios /></RotaProtegida>} />
          <Route path="/admin/conta" element={<RotaProtegida perfil="administrador"><AdminConta /></RotaProtegida>} />

          {/* Rota "coringa": qualquer URL que não bateu acima. Sempre a última. */}
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
      </BrowserRouter>
    </AutenticacaoProvider>
  );
}

export default App;
