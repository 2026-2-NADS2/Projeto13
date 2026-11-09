# KFKA – Plataforma de Acompanhamento Escolar

Projeto Interdisciplinar · 2º ADS · FECAP · 2026

Sistema web para escolas de Ensino Fundamental. O **Professor** registra o acompanhamento bimestral, a **Coordenação** revisa e publica, e a **Família** consulta o relatório, baixa em PDF e registra ciência.

## 🌐 Aplicação publicada

| | Endereço |
|---|---|
| **Site (front-end React, Netlify)** | **https://kfka-pi.netlify.app** |
| **API (Node.js + Express, Render)** | https://kfka-api.onrender.com · teste: [`/api/saude`](https://kfka-api.onrender.com/api/saude) |
| **Banco de dados** | MySQL 8.4 no Railway (acesso só pela API) |

> ⏳ **O primeiro acesso pode demorar até 1 minuto.** A API está no plano gratuito do Render, que "dorme" após 15 minutos sem uso. Se o login ficar em "Entrando...", aguarde: as próximas requisições são rápidas.

### Por que o deploy é feito a partir de outro repositório

O código **oficial** do projeto é este repositório, da organização da FECAP. É aqui que estão os commits e as entregas.

Para publicar, o Render e o Netlify precisam de permissão para ler o repositório no GitHub. Em repositórios de organização, essa permissão (instalar o app do Render/Netlify) **precisa ser aprovada por um administrador da organização**. O pedido foi feito, mas ficou aguardando aprovação, e o prazo da Entrega 2 não permitia esperar.

A solução foi criar um **espelho** deste repositório na conta pessoal de um integrante (`kfka-deploy`, privado), usado **apenas** como origem do deploy:

```
repositório da FECAP (este)  ──git push──────────────▶  entrega oficial
            │
            └───────────────git push deploy main─────▶  kfka-deploy  ──▶  Render (API)
                                                                      └─▶  Netlify (site)
```

- O código é **o mesmo**: os dois repositórios recebem os mesmos commits, com os mesmos identificadores (hash). Por exemplo, o commit `f548329` publicado no Render e no Netlify é o mesmo deste repositório.
- Se a organização aprovar o acesso, basta apontar o Render e o Netlify para este repositório e o espelho deixa de ser necessário.

### Como testar (dados fictícios, senha de todos: `senha123`)

| Perfil | E-mail | O que testar |
|---|---|---|
| Administrador | coordenacao@escola-teste.com | cadastrar usuários, revisar, alterar com justificativa, publicar, períodos, exportar |
| Professor | carla.lima@escola-teste.com | registrar, salvar rascunho, enviar, corrigir o devolvido (Bruno Lima) |
| Professor | rafael.dias@escola-teste.com | só vê as turmas dele |
| Responsável | mariana.souza@exemplo.com | mãe da Ana e do Pedro: relatórios, PDF, ciência |
| Responsável | joao.pereira@exemplo.com | pai do Igor (a Mariana NÃO vê o Igor) |

No seed, o **4º bimestre está aberto de 01/11 a 10/12/2026**, para a Entrega 2 e a apresentação. O administrador pode mudar essas datas na tela **Períodos**.

### Roteiro de demonstração (cenário de ponta a ponta do PI)

1. **Admin** → Usuários: cadastra um responsável novo, vinculado a um aluno. → Períodos: confere que o 4º bimestre está aberto.
2. **Professor (Carla)** → Minhas turmas → 5º A – Matemática → "Registrar" na Ana Souza → preenche e clica em **Enviar para revisão**.
3. **Admin** → Início → "Revisar" → altera a média (exige justificativa) → **Publicar**. O histórico mostra cada passo.
4. **Responsável (Mariana)** → o relatório aparece em "Recentes" → abre → **Baixar em PDF** → **Registrar ciência**.
5. **Professor** → abre o mesmo acompanhamento e vê o retorno da família.
6. **Admin** → Revisão → **Exportar (.csv)** abre no Excel.

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

## API

Todas as respostas são JSON. Em caso de erro, a resposta é `{ "erro": "mensagem" }`, com o status HTTP certo (400, 401, 403, 404, 409 ou 500). Menos o login, todas as rotas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método e rota | Perfil | Para quê |
|---|---|---|
| `GET /` · `GET /api/saude` | público | API no ar; `saude` também testa a conexão com o banco |
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
- **Credenciais fora do código:** no computador ficam no `server/.env` (no `.gitignore`); em produção, nas variáveis de ambiente do Render.
- **Menor privilégio no banco:** em produção a API usa o usuário `kfka_app`, que só pode ler e gravar dados (`SELECT`, `INSERT`, `UPDATE`, `DELETE`), sem poder apagar tabelas ou criar usuários.

## Como a aplicação foi publicada (Entrega 2 · Aula 13)

Seguimos o roteiro da Aula 13 (**MySQL gerenciado + API no Render + front no Netlify**). A ordem importa, porque cada etapa precisa de um endereço da anterior: banco → API → site → CORS.

> **Por que Railway e não Aiven?** O Aiven parou de criar bancos MySQL gratuitos em 06/11/2026. O Railway é uma das opções citadas na Aula 13 e oferece um crédito de teste que cobre a entrega e a apresentação.

### 1. Banco MySQL no Railway

1. Em railway.com: **New Project → Database → MySQL**.
2. No serviço MySQL → **Connect → Public Network → Add Public Access** e depois **Deploy** para ativar.
   - Por padrão o banco só aceita conexões de dentro do Railway. Como a API roda no Render, foi preciso um endereço **público** (`xxxx.proxy.rlwy.net` e uma porta própria, que **não** é 3306).
   - O endereço interno `mysql.railway.internal` não funciona fora do Railway.
3. No **MySQL Workbench**, uma conexão com esse host, porta, usuário `root` e senha (aba SSL: "If available"). O aviso de versão 8.4 pode ser ignorado ("Continue Anyway").
4. Executados os scripts (File → Open SQL Script → ⚡): `banco/schema.sql` e depois `banco/seed.sql`.
5. Conferência: `SELECT COUNT(*) FROM kfka.vw_relatorio_publicado;` → **13**.
6. **Usuário só para a API (princípio do menor privilégio):** a API não usa o `root`.
   ```sql
   CREATE USER 'kfka_app'@'%' IDENTIFIED BY 'SENHA_FORTE_GERADA';
   GRANT SELECT, INSERT, UPDATE, DELETE ON kfka.* TO 'kfka_app'@'%';
   ```
   A senha foi gerada com `node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"`. Assim, mesmo que a senha da API vazasse, não seria possível apagar tabelas nem criar usuários.

### 2. Espelho do repositório (ver "Por que o deploy é feito a partir de outro repositório")

```bash
# dentro da pasta deste repositório
git remote add deploy https://github.com/<conta-pessoal>/kfka-deploy.git
git push deploy main
```

### 3. API no Render

**New → Web Service → repositório `kfka-deploy`**, com os valores do `server/render.yaml`:

| Campo | Valor |
|---|---|
| Root Directory | `src/server` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/api/saude` (faz um `SELECT 1` no banco: o deploy só fica "Live" se a API conectar no MySQL) |

Variáveis de ambiente (cadastradas no painel do Render, **nunca** no código):

| Variável | Valor |
|---|---|
| `DB_HOST` / `DB_PORT` | host e porta **públicos** do Railway |
| `DB_USER` / `DB_PASSWORD` | `kfka_app` e a senha dele |
| `DB_NAME` | `kfka` |
| `DB_SSL` | `false` (o Railway não exige certificado) |
| `JWT_SECRET` | texto aleatório de 96 caracteres, gerado só para produção |
| `JWT_EXPIRA` | `2h` |
| `CORS_ORIGIN` | `https://kfka-pi.netlify.app` (adicionada depois do passo 4) |

### 4. Site no Netlify

1. `src/client/.env.production` com `VITE_API_URL=https://kfka-api.onrender.com` (**sem barra no final**). Este arquivo não tem segredo (só o endereço público da API) e por isso vai para o GitHub; o Vite lê o valor na hora do build.
2. **Add new project → Import a Git repository → GitHub → `kfka-deploy`**:

| Campo | Valor |
|---|---|
| Base directory | `src/client` |
| Build command | `npm run build` |
| Publish directory | `src/client/dist` |

O `src/client/netlify.toml` e o `public/_redirects` mandam qualquer endereço para o `index.html`, para o React Router funcionar ao apertar F5 numa página interna.

### 5. CORS

Site (`netlify.app`) e API (`onrender.com`) estão em endereços diferentes. Por segurança, o navegador só deixa o site chamar a API se ela autorizar aquela origem. Por isso, no Render: `CORS_ORIGIN=https://kfka-pi.netlify.app`. A API aceita **só** esse endereço, e não qualquer site.

### Como atualizar o site depois de uma mudança

```bash
git add <arquivos>
git commit -m "mensagem"
git push               # entrega oficial (este repositório)
git push deploy main   # Render e Netlify publicam a versão nova sozinhos
```

### Problemas comuns

- *"Não foi possível conectar ao servidor"* ou erro de CORS no console (F12): `CORS_ORIGIN` diferente da URL do Netlify (barra no final, `http` em vez de `https`).
- *Mudou algo e o site não mudou:* faltou o `git push deploy main`.
- *Logs do Render com `ECONNREFUSED`/`ETIMEDOUT`:* host ou porta errados (use o endereço público do Railway). `Access denied`: usuário ou senha. `Unknown database`: o `schema.sql` não foi executado.
- *Banco fora do ar depois de algumas semanas:* o crédito de teste do Railway acaba (cerca de 30 dias). Para manter o sistema no ar depois do semestre, será preciso um plano pago ou outro provedor.

## O que ainda não está no sistema

- **RF02/RF03 (parcial):** já existe o cadastro de usuários (responsáveis, professores e administradores), com vínculo de responsável a aluno e ativar/inativar. Ainda faltam as telas de alunos, turmas, disciplinas, tags e do vínculo professor × turma × disciplina; esses dados vêm do `seed.sql`.
- **RF01 – recuperação de senha por e-mail.** A tela de login orienta a procurar a secretaria.
- **RF09:** o PDF usa a impressão do navegador ("Salvar como PDF"). Uma biblioteca como jsPDF geraria o arquivo direto.
