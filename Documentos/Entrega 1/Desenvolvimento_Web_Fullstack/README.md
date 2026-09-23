# KFKA – Plataforma de Acompanhamento Escolar

Sistema web para escolas de Ensino Fundamental que conecta **Administrador**, **Professor** e **Pai/Responsável** no registro, na revisão e na publicação do acompanhamento bimestral dos alunos.

Projeto Interdisciplinar – 2º semestre de Análise e Desenvolvimento de Sistemas – FECAP (2026).

## Tecnologias

- **Front-end:** HTML5, CSS3 e JavaScript
- **Back-end:** Node.js + Express
- **Banco de dados:** MySQL (driver `mysql2`)

## Estrutura de pastas

```
prototipoKFKA/
├── public/                  ← tudo o que o navegador acessa
│   ├── css/
│   ├── js/
│   └── html/
│       ├── login/           login.html
│       ├── erro404/         404.html
│       ├── responsavel/     início, relatórios, detalhe do relatório, conta
│       ├── professor/       início, turmas, acompanhamento, conta
│       └── admin/           início, revisão, revisar, conta
├── server.js                ← servidor Express e rotas da API
├── db.js                    ← conexão com o MySQL (lê o .env)
├── schema.sql               ← cria o banco, as tabelas, os índices e a view
├── seed.sql                 ← dados FICTÍCIOS para teste
├── .env.example             ← modelo das variáveis de ambiente
└── package.json
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou mais recente
- MySQL 8 (ou MariaDB 10.6+) e, de preferência, o MySQL Workbench

## Como rodar o projeto

### 1. Instalar as dependências

No terminal, dentro da pasta `prototipoKFKA`:

```
npm install
```

### 2. Configurar as variáveis de ambiente

Copie o arquivo `.env.example`, renomeie a cópia para **`.env`** e preencha com os dados do **seu** MySQL:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=kfka
```

O arquivo `.env` guarda credenciais e **não é enviado ao repositório** (está no `.gitignore`).

### 3. Criar o banco e carregar os dados de teste

**Pelo MySQL Workbench:** File → Open SQL Script → abra o `schema.sql` → clique no raio (Execute). Depois faça o mesmo com o `seed.sql`.

**Pelo terminal** (no PowerShell, use `cmd /c`, porque ele não aceita o `<`):

```
cmd /c "mysql -u root -p < schema.sql"
cmd /c "mysql -u root -p kfka < seed.sql"
```

Se o banco `kfka` e as tabelas já existirem, rode apenas o `seed.sql`.

### 4. Iniciar o servidor

```
node server.js
```

O terminal deve mostrar `injected env (5) from .env` e `Servidor rodando em http://localhost:3000`.

Abra **http://localhost:3000** no navegador. Use sempre o endereço do servidor: abrir os arquivos HTML com dois cliques quebra os links.

## Usuários de teste

Criados pelo `seed.sql`. A senha de todos é **`senha123`** (guardada no banco como hash bcrypt).

| Perfil | E-mail |
| --- | --- |
| Administrador | coordenacao@escola-teste.com |
| Professor | carla.lima@escola-teste.com |
| Professor | rafael.dias@escola-teste.com |
| Responsável | mariana.souza@exemplo.com |
| Responsável | joao.pereira@exemplo.com |

## Rotas disponíveis

| Método e rota | O que faz |
| --- | --- |
| `GET /` | Redireciona para a tela de login |
| `GET /teste-db` | Confere a conexão com o banco |
| `GET /api/relatorios` | Lista os relatórios **publicados**, com filtros e paginação (10 por página) |
| Qualquer outro endereço | Página 404 (ou JSON de erro, se começar com `/api`) |

Filtros opcionais de `/api/relatorios`: `aluno`, `ano_letivo`, `bimestre` (1 a 4), `disciplina` e `pagina`.

Exemplo: http://localhost:3000/api/relatorios?aluno=1&bimestre=3

## Páginas por perfil

| Perfil | Páginas |
| --- | --- |
| Responsável | `html/responsavel/responsavel_inicio.html`, `responsavel_relatorios_filtro.html`, `responsavel_relatorio.html`, `responsavel_conta.html` |
| Professor | `html/professor/professor_inicio.html`, `professor_turmas.html`, `professor_acompanhamento.html`, `professor_conta.html` |
| Administrador | `html/admin/admin_inicio.html`, `admin_filtro_revisao.html`, `admin_revisar.html`, `admin_conta.html` |

## Segurança e privacidade (LGPD)

- Todos os dados do `seed.sql` são **fictícios**. Nunca use dados reais de alunos para testar.
- Senhas são guardadas apenas como hash (bcrypt).
- As consultas usam parâmetros (`?`) do `mysql2`, o que impede SQL Injection.
- A API não devolve dados além do necessário para cada tela (minimização de dados).

## Situação atual (Entrega 1)

- [x] Páginas HTML dos três perfis, login e página 404
- [x] Servidor Express com tratamento de rota inexistente
- [x] Banco de dados com tabelas, índices e view
- [x] Rota `GET /api/relatorios` com filtros, paginação e tratamento de erros
- [ ] CSS responsivo
- [ ] JavaScript das páginas (validação de formulários e consumo da API)
- [ ] Rota de login (`POST /api/login`)

## Equipe

- [Nome do integrante 1]
- [Nome do integrante 2]
- [Nome do integrante 3]
