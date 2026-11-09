# KFKA – Plataforma de Acompanhamento Escolar

Projeto Interdisciplinar · 2º ADS · FECAP · 2026

Sistema web para escolas de Ensino Fundamental. O **Professor** registra o acompanhamento bimestral, a **Coordenação** revisa e publica, e a **Família** consulta o relatório, baixa em PDF e registra ciência.

## Estrutura

```
src/              (pasta do código no repositório da FECAP)
├── banco/            schema.sql (tabelas, índices, view) e seed.sql (dados FICTÍCIOS)
├── server/           API: Node.js + Express + MySQL (mysql2) + JWT
│   ├── server.js         ponto de entrada, CORS, tratador de erros
│   ├── db.js             pool de conexões (credenciais no .env)
│   ├── middlewares/      autenticar (token) e exigirPerfil (perfil)
│   ├── modelos/          FluxoAcompanhamento: a classe do fluxo de estados
│   ├── rotas/            conta, geral, responsavel, professor, admin, usuarios
│   ├── utilitarios/      validação e ErroHttp
│   └── render.yaml       configuração do deploy no Render (Aula 13)
└── client/           Front-end: React + Vite + React Router (aulas 06 a 08 e 12)
    ├── netlify.toml      configuração do deploy no Netlify (Aula 13)
    └── src/
        ├── paginas/          uma pasta por perfil (16 telas + login + 404)
        ├── componentes/      Cabecalho, RotaProtegida, Trilha, Paginacao...
        ├── contextos/        AutenticacaoContexto (usuário logado + token)
        ├── servicos/         todas as chamadas à API (fetch)
        ├── utilitarios/      formatação, validação, hook useBusca
        └── index.css         o style.css da Entrega 1, adaptado
```

Na Entrega 1, o front era HTML + JavaScript puro, na pasta `public/`. Na Entrega 2 ele virou o app React da pasta `client/`, que mantém as mesmas tags, os mesmos `id`s e o mesmo CSS. O servidor agora só responde JSON.

## Como rodar no computador

Pré-requisitos: Node.js 20 ou mais novo e MySQL 8.

**1. Banco de dados** (na pasta `src`):

```bash
mysql -u root -p < banco/schema.sql
mysql -u root -p kfka < banco/seed.sql
```

**2. API** (terminal 1):

```bash
cd server
cp .env.example .env      # depois abra o .env e preencha a senha do MySQL e o JWT_SECRET
npm install
npm run dev               # http://localhost:3000/api/saude deve responder {"ok":true}
```

**3. Front-end** (terminal 2):

```bash
cd client
npm install
npm run dev               # abra http://localhost:5173
```

### Usuários de teste (senha de todos: `senha123`)

| Perfil | E-mail | O que testar |
|---|---|---|
| Administrador | coordenacao@escola-teste.com | cadastrar usuários, revisar, alterar com justificativa, publicar, períodos, exportar |
| Professor | carla.lima@escola-teste.com | registrar, salvar rascunho, enviar, corrigir o devolvido (Bruno Lima) |
| Professor | rafael.dias@escola-teste.com | só vê as turmas dele |
| Responsável | mariana.souza@exemplo.com | mãe da Ana e do Pedro: relatórios, PDF, ciência |
| Responsável | joao.pereira@exemplo.com | pai do Igor (a Mariana NÃO vê o Igor) |

No seed, o **4º bimestre está aberto de 01/11 a 10/12/2026**, para a Entrega 2 e a apresentação. O administrador pode mudar essas datas na tela **Períodos**.

## Roteiro de demonstração (cenário de ponta a ponta do PI)

1. **Admin** → Usuários: cadastra um responsável novo, vinculado à Ana Souza (cadastro da E2). → Períodos: confere que o 4º bimestre está aberto.
2. **Professor (Carla)** → Minhas turmas → 5º A – Matemática → "Registrar" na Ana Souza → preenche e clica em **Enviar para revisão**.
3. **Admin** → Início → "Revisar" → altera a média (exige justificativa) → **Publicar**. O histórico mostra cada passo.
4. **Responsável (Mariana)** → o relatório aparece em "Recentes" → abre → **Baixar em PDF** → **Registrar ciência**.
5. **Professor** → abre o mesmo acompanhamento e vê o retorno da família.
6. **Admin** → Revisão → **Exportar (.csv)** abre no Excel.

## API

Todas as respostas são JSON. Em caso de erro, a resposta é `{ "erro": "mensagem" }`, com o status HTTP certo (400, 401, 403, 404, 409 ou 500). Menos o login, todas as rotas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método e rota | Perfil | Para quê |
|---|---|---|
| `POST /api/login` | público | devolve `{ token, usuario }` |
| `GET /api/conta` · `PUT /api/conta/senha` | todos | dados da conta e troca de senha |
| `GET /api/tags` · `GET /api/bimestres` | professor, admin | dados de apoio |
| `GET /api/responsavel/alunos` | responsável | alunos vinculados |
| `GET /api/responsavel/relatorios` | responsável | lista paginada, só dos alunos vinculados e só publicados |
| `GET /api/responsavel/relatorios/:id` | responsável | detalhe (404 se for de outra família) |
| `POST /api/responsavel/relatorios/:id/ciencia` | responsável | RF12 |
| `GET /api/professor/turmas` | professor | turmas e disciplinas vinculadas |
| `GET /api/professor/turmas/:id/alunos` | professor | alunos e situação no bimestre |
| `GET/POST /api/professor/acompanhamentos` | professor | listar e criar (rascunho ou enviar) |
| `GET/PUT /api/professor/acompanhamentos/:id` | professor | ver e editar (só rascunho/devolvido, no período) |
| `GET /api/admin/resumo` · `GET /api/admin/filtros` | admin | painel e opções dos filtros |
| `GET /api/admin/acompanhamentos` | admin | lista paginada com filtros |
| `GET /api/admin/acompanhamentos/exportar` | admin | CSV para o Excel (RF11) |
| `GET/PUT /api/admin/acompanhamentos/:id` | admin | ver e alterar com justificativa |
| `POST /api/admin/acompanhamentos/:id/decisao` | admin | publicar, devolver ou cancelar |
| `GET /api/admin/acompanhamentos/:id/historico` | admin | auditoria (RF07) |
| `PUT /api/admin/bimestres/:id` | admin | período de digitação (RF04) |
| `GET/POST /api/admin/usuarios` | admin | listar e cadastrar usuários (RF02); 409 se o e-mail já existe |
| `GET /api/admin/usuarios/alunos` | admin | alunos para vincular ao responsável |
| `PATCH /api/admin/usuarios/:id/ativo` | admin | ativar ou inativar (não apaga, por causa da auditoria) |

## Segurança e LGPD (o que foi feito e onde)

- **Senhas com hash bcrypt.** A senha nunca é guardada nem devolvida (`rotas/conta.js` e `rotas/usuarios.js`).
- **Cadastro só pelo administrador.** Na Aula 11 o registro é aberto a qualquer visitante. No KFKA, quem cadastra responsáveis e professores é a escola (RF02), e um cadastro aberto deixaria estranhos criarem contas num sistema com dados de crianças (LGPD). A técnica é a mesma da aula (bcrypt, 409 para e-mail repetido), mas a rota exige login de administrador.
- **Login com JWT e expiração** (`JWT_EXPIRA`, padrão 2h). O React volta ao login com o aviso "Sua sessão expirou".
- **Autorização em toda rota** (`middlewares/autenticacao.js`): 401 sem login, 403 com o perfil errado.
- **Filtro por vínculo.** O responsável só vê os alunos da tabela `aluno_responsavel` e o professor só vê as próprias turmas (`turma_disc_prof`). Isso corrigiu a falha da Entrega 1, em que a Mariana via o relatório do Igor.
- **SQL Injection:** todos os valores vão como parâmetros `?` do mysql2.
- **XSS:** o JSX sempre mostra textos como texto; não há `dangerouslySetInnerHTML`.
- **CSRF:** o token vai no cabeçalho, e não em cookie, então outro site não consegue usá-lo.
- **Minimização de dados:** as listas não trazem a descrição e a exportação não inclui textos sobre a criança.
- **Auditoria:** a classe `FluxoAcompanhamento` grava o histórico em toda mudança de status, dentro de uma transação.
- **Credenciais fora do código:** ficam no `server/.env`, que está no `.gitignore`.

## Publicar (Entrega 2: "aplicação publicada" · Aula 13)

Seguimos o roteiro da Aula 13: **MySQL gerenciado (Railway) + API no Render + front no Netlify**. Faça nesta ordem, porque cada etapa precisa de um endereço da anterior.

> Por que Railway e não Aiven? O Aiven parou de criar MySQL gratuitos em 06/11/2026. O Railway é uma das opções citadas na Aula 13 e dá um crédito de teste que cobre a entrega e a apresentação.

### 1. Banco MySQL na nuvem (Railway)

1. Entre em railway.com com a conta do GitHub.
2. **New Project → Database → MySQL** (ou **Deploy MySQL**). Espere o serviço ficar verde.
3. Clique no serviço MySQL → **Connect** (ou aba **Variables**) → **Public Network**. Anote:
   - **host** público: algo como `xxxx.proxy.rlwy.net` (variável `RAILWAY_TCP_PROXY_DOMAIN`);
   - **porta** pública: um número como `12345`, **não** 3306 (`RAILWAY_TCP_PROXY_PORT`);
   - **usuário** `root` e a **senha** (`MYSQLPASSWORD`).
   > Não use `mysql.railway.internal`: esse endereço só funciona para serviços que rodam DENTRO do Railway. A nossa API roda no Render, então precisa do endereço público.
4. No **MySQL Workbench**, crie uma conexão nova com esse host, porta, usuário e senha (aba SSL: "If available"). Depois:
   - File → Open SQL Script → `banco/schema.sql` → executar (raio ⚡). Ele cria o banco `kfka`;
   - File → Open SQL Script → `banco/seed.sql` → executar.
5. Confira: `SELECT COUNT(*) FROM kfka.vw_relatorio_publicado;` deve dar **13**.

### 2. API no Render

1. Em render.com, **New → Web Service** e conecte o repositório do GitHub.
2. Preencha (são os valores do `server/render.yaml`):
   - **Root Directory:** `src/server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Health Check Path:** `/api/saude`
3. Em **Environment**, crie as variáveis:

| Variável | Valor |
|---|---|
| `DB_HOST` | o host **público** do Railway (`xxxx.proxy.rlwy.net`) |
| `DB_PORT` | a porta **pública** do Railway (não é 3306) |
| `DB_USER` | `root` |
| `DB_PASSWORD` | a senha do Railway |
| `DB_NAME` | `kfka` |
| `DB_SSL` | `false` |
| `JWT_SECRET` | um texto longo e aleatório **novo** (não reaproveite o do seu computador) |
| `JWT_EXPIRA` | `2h` |
| `CORS_ORIGIN` | deixe vazio por enquanto; volta no passo 4 |

4. Depois do deploy, abra `https://SEU-SERVICO.onrender.com/api/saude`. Tem que aparecer `{"ok":true}`. Se der erro, veja a aba **Logs** do Render. `ECONNREFUSED` ou `ETIMEDOUT` = host/porta errados (confira se usou o endereço público do Railway); `Access denied` = usuário/senha; `Unknown database` = o `schema.sql` não foi rodado.

### 3. Front no Netlify

1. No `src/client/.env.production`, troque `https://SEU-SERVICO.onrender.com` pela URL real do Render (**sem barra no final**) e faça commit.
2. Em netlify.com, **Add new site → Import from Git** e escolha o repositório:
   - **Base directory:** `src/client`
   - **Build command:** `npm run build`
   - **Publish directory:** `src/client/dist`
   (o `src/client/netlify.toml` já traz isso e o redirecionamento do React Router)
3. Anote a URL do site, por exemplo `https://kfka.netlify.app`.

### 4. Fechar o ciclo

Volte ao Render → Environment → `CORS_ORIGIN` = URL do Netlify (**sem barra no final**) → salve. O Render reinicia a API sozinho.

### 5. Checklist no site publicado (critérios de aceite da Aula 13)

- [ ] Login com os três perfis; o cabeçalho mostra o nome.
- [ ] Admin → Usuários: cadastrar um usuário novo e entrar com ele.
- [ ] Professor envia um acompanhamento; admin publica; responsável vê, baixa o PDF e registra ciência.
- [ ] Admin → Revisão → Exportar (.csv).
- [ ] F5 em `/responsavel/relatorios` não dá 404.
- [ ] `/qualquer-coisa` mostra a página 404 do KFKA, não a do Netlify.
- [ ] Nenhuma URL da API escrita no código: tudo vem de `VITE_API_URL`.

**Problemas comuns:**
- *"Não foi possível conectar ao servidor"* ou erro de CORS no console: `CORS_ORIGIN` diferente da URL do Netlify (barra no final, `http` em vez de `https`).
- *Banco fora do ar depois de algumas semanas:* o crédito de teste do Railway acaba (cerca de 30 dias). Para manter o sistema no ar depois do semestre, será preciso um plano pago ou outro provedor.
- *Primeiro acesso muito lento:* o Render gratuito "dorme" após 15 minutos parado. Antes de apresentar, abra `/api/saude` e espere responder.
- *Mudou o `.env.production` e nada mudou no site:* o Vite lê a variável na hora do build; faça um novo deploy no Netlify.

**Links publicados:**
- Front: _preencher_
- API: _preencher_

## O que ainda não está no sistema

- **RF02/RF03 (parcial):** já existe o cadastro de usuários (responsáveis, professores e administradores), com vínculo de responsável a aluno e ativar/inativar. Ainda faltam as telas de alunos, turmas, disciplinas, tags e do vínculo professor × turma × disciplina; esses dados vêm do `seed.sql`.
- **RF01 – recuperação de senha por e-mail.** A tela de login orienta a procurar a secretaria.
- **RF09:** o PDF usa a impressão do navegador ("Salvar como PDF"). Uma biblioteca como jsPDF geraria o arquivo direto.
