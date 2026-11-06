# KFKA – Plataforma de Acompanhamento Escolar (Backend) – Entrega 2

**Equipe Nova Stark** · Programação Orientada a Objetos

Entrega 2: o backend da Entrega 1 agora roda **na nuvem**, conectado a um **banco MySQL na nuvem**,
usando o mesmo modelo de banco do grupo (`schema.sql` e `seed.sql` da pasta *Entrega 2 / Banco de dados*).

- **API na nuvem (Render):** `https://SEU-ENDERECO.onrender.com`  ← trocar pelo link real
- **Teste rápido:** abrir `https://SEU-ENDERECO.onrender.com/api/saude` → `{"api":"ok","banco":"ok"}`

> No plano gratuito do Render o servidor "dorme" quando fica parado. O primeiro acesso pode levar até 1 minuto.

## O que mudou da Entrega 1 para a Entrega 2

| Entrega 1 | Entrega 2 |
|---|---|
| Rodava só no `localhost` | Roda na nuvem (Render) com banco MySQL na nuvem (Aiven) |
| Usuário simulado pelo header `x-usuario-id` | **Login de verdade**: e-mail + senha (bcrypt) e token **JWT** |
| Banco criado à mão pelo terminal | O servidor **cria o banco sozinho** na primeira vez (`schema.sql` + `seed.sql`) |
| Devolução sem motivo | Devolução exige **motivo**, gravado no histórico |
| — | **Ciência do responsável** (RF12), usando a tabela `ciencia` do grupo |
| — | Listas: fila de revisão (admin) e "meus acompanhamentos" (professor) |
| — | CORS liberado para o front-end consumir a API |

## Arquitetura (camadas)

```
src/
  routes/        → recebe a requisição HTTP e chama a classe principal
  core/          → SistemaKFKA: CLASSE PRINCIPAL que orquestra tudo
                   Autenticador: gera e confere o token de login (JWT)
  models/        → classes de domínio (Usuario, Aluno, Bimestre, Acompanhamento, Ciencia...)
  repositories/  → acesso ao banco (único lugar com SQL)
  config/        → conexão com o MySQL (local ou nuvem, com SSL)
database/        → schema.sql e seed.sql do grupo
scripts/         → criarBanco.js (cria/recria o banco)
```

## Conceitos de POO aplicados

| Conceito | Onde |
|---|---|
| Classe abstrata | `Usuario` não pode ser instanciada |
| Herança | `Administrador`, `Professor`, `Responsavel` estendem `Usuario`; repositórios estendem `BaseRepository` |
| Polimorfismo | cada perfil sobrescreve `perfil` e `permissoes` |
| Encapsulamento | `#senhaHash` só é usado dentro de `Usuario.conferirSenha()`; `#segredo` do `Autenticador`; dependências privadas da `SistemaKFKA` |
| Composição / injeção de dependência | `SistemaKFKA` recebe o `pool` e o `Autenticador` no construtor |
| Factory | `UsuarioFactory` cria a subclasse certa a partir do banco |
| Facade | `SistemaKFKA` é o ponto único de entrada das operações |
| Máquina de estados | `Acompanhamento.alterarStatus()` + `StatusAcompanhamento` |
| Transações | `#emTransacao()`: status + histórico gravados juntos ou nada é gravado |

## Usuários de teste (senha de todos: `senha123`)

| Perfil | E-mail |
|---|---|
| Administrador | coordenacao@escola-teste.com |
| Professor | carla.lima@escola-teste.com |
| Professor | rafael.dias@escola-teste.com |
| Responsável (Ana e Pedro) | mariana.souza@exemplo.com |
| Responsável (Igor) | joao.pereira@exemplo.com |

## Como usar a API

1. Fazer login:
   ```
   POST /api/login
   {"email":"carla.lima@escola-teste.com","senha":"senha123"}
   ```
   A resposta traz um `token`.
2. Nas outras rotas, enviar o cabeçalho: `Authorization: Bearer <token>`

### Endpoints

| Método | Rota | Perfil |
|---|---|---|
| POST | /api/login | Público |
| GET | /api/eu | Qualquer logado |
| GET | /api/saude | Público |
| POST | /api/alunos | Admin |
| GET | /api/alunos | Admin |
| POST | /api/bimestres | Admin |
| GET | /api/revisao?status=enviado_revisao | Admin |
| GET | /api/professor/acompanhamentos?status=rascunho | Professor |
| POST | /api/acompanhamentos | Professor |
| PATCH | /api/acompanhamentos/:id/enviar | Professor |
| PATCH | /api/acompanhamentos/:id/revisar | Admin |
| PATCH | /api/acompanhamentos/:id/publicar | Admin |
| PATCH | /api/acompanhamentos/:id/devolver  `{"motivo":"..."}` | Admin |
| PATCH | /api/acompanhamentos/:id/cancelar | Admin |
| GET | /api/acompanhamentos/:id/historico | Admin / Professor dono |
| GET | /api/acompanhamentos/:id/ciencias | Admin / Professor dono |
| GET | /api/responsavel/alunos/:alunoId/relatorios | Responsável vinculado |
| POST | /api/acompanhamentos/:id/ciencia  `{"observacao":"..."}` | Responsável vinculado |

### Fluxo completo de exemplo

```
POST  /api/login  (Carla, professora)
POST  /api/acompanhamentos
      {"alunoId":3,"turmaId":1,"disciplinaId":3,"bimestreId":4,
       "descricao":"Participa bem das aulas práticas de Ciências.","media":8,"tagIds":[1,3]}
PATCH /api/acompanhamentos/18/enviar
POST  /api/login  (Coordenação)
PATCH /api/acompanhamentos/18/revisar
PATCH /api/acompanhamentos/18/publicar
POST  /api/login  (Mariana, responsável)
GET   /api/responsavel/alunos/1/relatorios
POST  /api/acompanhamentos/8/ciencia   {"observacao":"Li e gostei!"}
```

### Erros tratados (status HTTP)

400 dados inválidos · 401 sem login/token inválido · 403 perfil sem acesso ·
404 não encontrado · 409 duplicado (ex.: ciência repetida) · 422 regra de negócio
(ex.: fora do período do bimestre, transição de status inválida).

## Como rodar no computador (localhost)

1. Instalar Node.js 18+ e MySQL 8.
2. Copiar `.env.example` para `.env` e preencher a senha do MySQL e um `JWT_SECRET`.
3. `npm install`
4. `npm run dev`. Na primeira vez o banco `kfka` é criado sozinho.
5. Abrir http://localhost:3000/api/saude

Para zerar os dados de exemplo: `npm run db:criar`.

## Como foi colocado na nuvem

**Banco: Aiven (MySQL gratuito)**
1. Criar um serviço MySQL gratuito em https://aiven.io
2. Copiar Host, Port, User e Password do serviço.

**Backend: Render (Web Service gratuito)**
1. New → Web Service → repositório público `https://github.com/2026-2-NADS2/projeto13`
2. Root Directory: `Documentos/Entrega 2/Programação Orientada a Objetos`
3. Build Command: `npm install` · Start Command: `npm start`
4. Variáveis de ambiente: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME=kfka`,
   `DB_SSL=true`, `JWT_SECRET`
5. Ao iniciar, o servidor cria o banco `kfka` no Aiven com o `schema.sql` e o `seed.sql`.
