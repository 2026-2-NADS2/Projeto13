# Desenvolvimento Web Full Stack – Entrega 2

**KFKA – Plataforma de Acompanhamento Escolar** · Projeto Interdisciplinar · 2º ADS · FECAP · 2026

**Responsáveis:** André Seiji Shiroma e Enzo Mancio

Na Entrega 2 o KFKA ganhou o back-end completo (API em Node.js + Express + MySQL, com login e rotas protegidas), o front-end passou para React conforme o feedback do professor dado pelo Gamefy, e o sistema foi publicado na nuvem.

## 🌐 Sistema publicado

| | Endereço |
|---|---|
| **Site** | **https://kfka-pi.netlify.app** |
| **API** | https://kfka-api.onrender.com · teste: [`/api/saude`](https://kfka-api.onrender.com/api/saude) |

> ⏳ O primeiro acesso pode levar até 1 minuto: a API está no plano gratuito do Render, que "dorme" após 15 minutos sem uso.

**Contas de teste** (dados fictícios, senha de todas: `senha123`):

| Perfil | E-mail |
|---|---|
| Administrador | coordenacao@escola-teste.com |
| Professor | carla.lima@escola-teste.com |
| Responsável | mariana.souza@exemplo.com |


> 📌 **O `schema.sql` e o `seed.sql` também estão dentro do zip** (na pasta `src/banco/`). Deixamos uma cópia separada aqui para facilitar a consulta, sem precisar descompactar. As duas cópias são idênticas e são as mesmas usadas no banco publicado.


## ✅ Critérios da Entrega 2 e onde encontrá-los

| Critério do documento do PI | Onde está |
|---|---|
| API funcional com as rotas principais (listar, detalhar, criar…) | `src/server/rotas/`: mais de 25 rotas para os três perfis (tabela completa no `src/README.md`) |
| Persistência em banco de dados | MySQL, com acesso pelo driver `mysql2` (`src/server/db.js`); mudanças de status gravadas em transação, com histórico |
| Autenticação de usuário (cadastro/login) e rota protegida | Login com JWT (`POST /api/login`); cadastro de usuários pelo administrador (`src/server/rotas/usuarios.js`); todas as rotas, menos o login, exigem token e o perfil certo (`src/server/middlewares/autenticacao.js`) |
| Validação de dados e erros padronizados | Validação em todas as rotas (`src/server/utilitarios/validacao.js`); todo erro responde `{ "erro": "mensagem" }` com o status HTTP correto (400, 401, 403, 404, 409, 500) |
| Variáveis sensíveis fora do código | `src/server/.env` (fora do Git pelo `.gitignore`), modelo em `.env.example`; em produção, variáveis de ambiente do Render |
| Aplicação publicada (front e back juntos) | Site no Netlify, API no Render e banco MySQL no Railway (links acima) |
| Commits de todos os integrantes | Histórico deste repositório |

**Sobre o cadastro:** no exemplo da Aula 11 o registro é aberto a qualquer visitante. No KFKA, o cadastro de responsáveis e professores é feito **pelo administrador** (tela "Usuários"). Fizemos assim porque, pelo RF02 do PI, quem cadastra é a escola, e porque o sistema guarda dados de crianças (LGPD): um cadastro aberto deixaria qualquer pessoa criar uma conta. A técnica é a mesma da aula (senha com bcrypt e 409 para e-mail repetido), mas a rota exige login de administrador.

## 🚀 Como foi feito o deploy (resumo)

Seguimos o roteiro da Aula 13:

```
Site (React)  ──▶  API (Express)  ──▶  Banco (MySQL)
  Netlify           Render              Railway
```

- **Banco no Railway, e não no Aiven:** o Aiven parou de criar bancos MySQL gratuitos.
- **A API usa um usuário de banco só dela (`kfka_app`)**, que pode ler e gravar dados, mas não pode apagar tabelas (princípio do menor privilégio).
- **O deploy sai de um repositório espelho.** Para o Render e o Netlify lerem um repositório da organização da FECAP, um administrador da organização precisa aprovar o acesso. O pedido ficou pendente, então criamos um **espelho privado** deste repositório na conta pessoal de um integrante, usado só como origem do deploy. O código é o mesmo: os dois repositórios recebem os mesmos commits, com os mesmos identificadores (hash).

O passo a passo completo está no `src/README.md`.

## 💻 Como rodar no computador (a partir do zip)

Pré-requisitos: Node.js 20 ou mais novo e MySQL 8.

```bash
# 1. Banco (na pasta src descompactada)
mysql -u root -p < banco/schema.sql
mysql -u root -p kfka < banco/seed.sql

# 2. API (terminal 1)
cd server
cp .env.example .env     # preencher a senha do MySQL e um JWT_SECRET
npm install
npm run dev              # http://localhost:3000/api/saude → {"ok":true}

# 3. Site (terminal 2)
cd client
npm install
npm run dev              # http://localhost:5173
```
