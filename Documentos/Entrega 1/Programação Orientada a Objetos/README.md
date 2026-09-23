# KFKA – Plataforma de Acompanhamento Escolar (Backend)

Entrega 1 de Programação Orientada a Objetos: estrutura básica do backend com classes,
banco de dados MySQL e execução em servidor local.

## Como rodar

1. Instale Node.js 18+ e MySQL 8.
2. Crie o banco (script do grupo) e os dados de teste:
   ```
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
3. Copie `.env.example` para `.env` e coloque a sua senha do MySQL.
4. Instale e rode:
   ```
   npm install
   npm run dev
   ```
5. Acesse http://localhost:3000/api/saude, que deve responder `{"api":"ok","banco":"ok"}`.

## Arquitetura (camadas)

```
routes/        → recebe a requisição HTTP e chama a classe principal
core/          → SistemaKFKA: CLASSE PRINCIPAL que orquestra permissões, regras e transações
models/        → classes de domínio (Usuario, Aluno, Bimestre, Acompanhamento...)
repositories/  → acesso ao banco (único lugar com SQL)
database/      → schema.sql e seed.sql
```

## Conceitos de POO aplicados

| Conceito | Onde |
|---|---|
| Classe abstrata | `Usuario` não pode ser instanciada |
| Herança | `Administrador`, `Professor`, `Responsavel` estendem `Usuario`; repositórios estendem `BaseRepository` |
| Polimorfismo | cada perfil sobrescreve `perfil` e `permissoes` |
| Encapsulamento | `#senhaHash` e as dependências privadas de `SistemaKFKA` |
| Factory | `UsuarioFactory` cria a subclasse certa a partir do banco |
| Facade | `SistemaKFKA` é o ponto único de entrada das operações |
| Máquina de estados | `Acompanhamento.alterarStatus()` + `StatusAcompanhamento` |

## Integração com Banco de Dados

O backend usa exatamente o `schema.sql` do grupo (tabelas, índices e a view).
A consulta de relatórios do responsável lê a **view `vw_relatorio_publicado`**,
que já filtra somente os acompanhamentos com status `publicado`.

## Usuários de teste (header `x-usuario-id`)

O login com JWT entra na próxima etapa. Por enquanto, o usuário logado é informado no header:

| id | Perfil | E-mail |
|---|---|---|
| 1 | Administrador | admin@kfka.com |
| 2 | Professor (Matemática, 5A) | professor@kfka.com |
| 3 | Responsável (do aluno 1) | responsavel@kfka.com |

## Endpoints

| Método | Rota | Perfil |
|---|---|---|
| POST | /api/alunos | Admin |
| GET | /api/alunos | Admin |
| POST | /api/bimestres | Admin |
| POST | /api/acompanhamentos | Professor |
| PATCH | /api/acompanhamentos/:id/enviar | Professor |
| PATCH | /api/acompanhamentos/:id/revisar | Admin |
| PATCH | /api/acompanhamentos/:id/publicar | Admin |
| PATCH | /api/acompanhamentos/:id/devolver | Admin |
| PATCH | /api/acompanhamentos/:id/cancelar | Admin |
| GET | /api/acompanhamentos/:id/historico | Admin / Professor dono |
| GET | /api/responsavel/alunos/:alunoId/relatorios | Responsável vinculado |

### Exemplo: cadastrar aluno
```
POST /api/alunos   (x-usuario-id: 1)
     {"nome":"Maria Souza","dataNascimento":"2015-07-20","turmaId":1}
```

### Exemplo de fluxo completo
```
POST  /api/acompanhamentos          (x-usuario-id: 2)
      {"alunoId":1,"turmaId":1,"disciplinaId":1,"bimestreId":1,
       "descricao":"Aluno participativo nas aulas","media":8.5,"tagIds":[1,3]}
PATCH /api/acompanhamentos/1/enviar   (x-usuario-id: 2)
PATCH /api/acompanhamentos/1/revisar  (x-usuario-id: 1)
PATCH /api/acompanhamentos/1/publicar (x-usuario-id: 1)
GET   /api/responsavel/alunos/1/relatorios (x-usuario-id: 3)
```
