# Entregas do PI
### **DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL**

**Projeto Interdisciplinar:** KFKA – Plataforma de Acompanhamento Escolar
**Curso:** Análise e Desenvolvimento de Sistemas – 2º semestre de 2026 – FECAP
**Dados enviados à IA:** somente o documento do PI, o código do grupo e os dados **fictícios** do `seed.sql`. Nenhum dado real de alunos, responsáveis, professores ou da FECAP foi enviado.
**Revisão humana:** todo o conteúdo gerado foi lido, testado e ajustado pelo grupo.

## Entrega 1
<br><br>

### Disciplina 1

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma e Enzo Mancio |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Desenvolvimento Web Full Stack – Entrega 1 (front-end) |
| **Finalidade de uso** | Geração e explicação de código: correções e ajustes das páginas HTML, CSS e JavaScript (login com validação, lista de relatórios com filtros e paginação), conexão do Express com o MySQL, criação das rotas `GET /api/relatorios` e `POST /api/login` e correção de erros de configuração (`.env`, `dotenv`). |
| ***Prompts* principais utilizados** | "Me ajude a corrigir o bug dessa página"; "Como ajustar a caixa/estilo dessa página CSS?"; "Por que esse código JS não está funcionando?"; "Por que o banco MySQL não está se integrando com o site?"; "Como faço para colocar e ajustar essa API?"; "Por que essa página não está se conectando com a outra página?" |
| **Trechos ou entregas afetadas** | `server.js`, `db.js`, `.env.example`, páginas em `public/html/`, `public/css/style.css`, `public/js/` (`comum.js`, `login.js`, `responsavel_relatorios.js`). |

### Disciplina 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 1 (índices) |
| **Finalidade de uso** | Apoio à modelagem (as decisões sobre tabelas e relacionamentos foram discutidas e tomadas pelo grupo), escrita e teste do `schema.sql` (tabelas, os 3 índices e a view), ideias de dados fictícios para o `seed.sql` e geração do documento Word com a justificativa dos índices, revisado pelo grupo. |
| ***Prompts* principais utilizados** | "Por que essa linha está vermelha no schema no meu MySQL?"; "A estrutura desse schema está correta?"; "Teste para mim se esse schema está funcionando"; "Me ajude a dar ideias de dados fictícios no seed"; pedido para montar o documento da Entrega 1 com a justificativa dos índices. |
| **Trechos ou entregas afetadas** | `schema.sql` (tabelas, índices e view), `seed.sql` (dados fictícios), documento "KFKA_BancoDeDados_Entrega1_Indices.docx". |

### Disciplina 3

| **Aluno(s) Responsável(veis)** | [preencher] |
| :--- | :--- |
| **Ferramenta utilizada** | [preencher] |
| **Versão/modelo** | [preencher] |
| **Disciplina / Trabalho** | [preencher] |
| **Finalidade de uso** | [preencher] |
| ***Prompts* principais utilizados** | [preencher] |
| **Trechos ou entregas afetadas** | [preencher] |

## Entrega 2
<br><br>

### Disciplina 1

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma e Enzo Mancio |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Desenvolvimento Web Full Stack – Entrega 2 (back-end e migração para React) |
| **Finalidade de uso** | Geração e explicação de código: migração do front-end para React (Vite, React Router e Context API, seguindo o material das aulas 06 a 08), API em Express com login por JWT, rotas protegidas por perfil, validação e respostas de erro padronizadas, testes automatizados da API e das telas e `README.md` de instalação e publicação. |
| ***Prompts* principais utilizados** | "Esqueci de colocar o React nesse zip; faça os testes depois de colocar o React, usando o schema"; "Com base no documento do PI, é preciso migrar tudo para o React?"; envio do material de React do professor (aulas 06 a 08) para seguir o mesmo padrão; "Por que o banco MySQL não está se integrando com o site?" |
| **Trechos ou entregas afetadas** | Pasta `client/` (React), pasta `server/` (`server.js`, `db.js`, `rotas/`, `middlewares/`, `utilitarios/`), `.env.example`, `README.md` de instalação. |

### Disciplina 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic) |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 2 (view) |
| **Finalidade de uso** | Ajustes do `schema.sql` para a Entrega 2 (tabela `ciencia` e coluna `historico.observacao`), atualização do `seed.sql` com dados fictícios, teste do schema e do seed junto com o site, execução das consultas sobre a view e geração do documento Word da view, revisado pelo grupo. |
| ***Prompts* principais utilizados** | "Teste se o schema e o seed estão conversando direito no nosso site"; "Houve alguma alteração no arquivo do schema e do seed?"; "Vamos começar com a segunda entrega do banco de dados". |
| **Trechos ou entregas afetadas** | `banco/schema.sql`, `banco/seed.sql`, documento "KFKA_BancoDeDados_Entrega2_View.docx". |

### Disciplina 3

| **Aluno(s) Responsável(veis)** | [preencher] |
| :--- | :--- |
| **Ferramenta utilizada** | [preencher] |
| **Versão/modelo** | [preencher] |
| **Disciplina / Trabalho** | [preencher] |
| **Finalidade de uso** | [preencher] |
| ***Prompts* principais utilizados** | [preencher] |
| **Trechos ou entregas afetadas** | [preencher] |

***Declaro que o uso acima descrito está em conformidade com o GUIA PARA O USO RESPONSÁVEL DE
INTELIGÊNCIA ARTIFICIAL NA FECAP e que o conteúdo final é de minha plena responsabilidade
autoral.***

| Integrante | RA |
| :--- | :--- |
| André Seiji Shiroma | 26029347 |
| Clayton Santos Ferreira | 26029419 |
| Marcos Almeida Daloia | 25027861 |
| Enzo Mancio | 25027739 |

São Paulo, 06 de novembro de 2026.
