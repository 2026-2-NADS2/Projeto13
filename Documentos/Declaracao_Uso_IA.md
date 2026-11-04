# Declaração de Uso de Inteligência Artificial

**Projeto Interdisciplinar:** KFKA – Plataforma de Acompanhamento Escolar
**Curso:** Análise e Desenvolvimento de Sistemas – 2º semestre de 2026 – FECAP
**Integrantes:** André Seiji Shiroma, Clayton Santos Ferreira, Marcos Almeida Daloia, Enzo Mancio

Esta declaração segue o modelo do **Guia para o Uso Responsável de Inteligência Artificial na FECAP** (versão 2.0, de 29/07/2026, Art. 6º e 7º) e informa, para cada disciplina do semestre, como a IA generativa foi usada no projeto.

---

## 1. Visão geral

| Campo | Informação |
| --- | --- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai, dentro de um Projeto que tinha como referência o documento oficial do PI |
| **Versão/modelo** | Claude Opus 5.5 *[conferir se outros modelos foram usados nas conversas anteriores]* |
| **Período de uso** | Setembro a novembro de 2026 (Entrega 1, Entrega 2 e banner) |
| **Dados enviados à IA** | Somente o documento do PI, o código do grupo e os dados **fictícios** do `seed.sql`. Nenhum dado real de alunos, responsáveis, professores ou da FECAP foi enviado à ferramenta (Art. 5º do guia e LGPD). |
| **Revisão humana** | Todo o conteúdo gerado foi lido, testado e ajustado pelo grupo. O grupo é o responsável integral pelo conteúdo final (Art. 3º). |

---

## 2. Uso por disciplina

### 2.1 Desenvolvimento Web Full Stack

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | Claude – Claude Opus 5.5 |
| **Finalidade de uso** | Geração e explicação de código: estrutura das 15 páginas HTML, servidor Express, conexão com o MySQL, rotas da API, login com JWT, migração do front-end para React e correção de erros de configuração (`.env`, `dotenv`). Elaboração do guia das páginas para CSS e JS. |
| **Prompts principais** | "Seguinte, eu esqueci de colocar o React nesse arquivo zip, estou te mandando também o schema para você fazer os testes depois de colocar o React"; pedidos para montar as páginas HTML de cada perfil com comentários explicando cada elemento; pedidos de ajuda para conectar o Node.js ao MySQL. |
| **Trechos ou entregas afetadas** | `server.js`, `db.js`, `.env.example`, páginas em `public/html/`, pasta `client/` (React), pasta `server/` (rotas e middlewares), `README.md` de instalação, documento "KFKA – Guia das páginas HTML para CSS e JS". |

### 2.2 Banco de Dados

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | Claude – Claude Opus 5.5 |
| **Finalidade de uso** | Apoio à modelagem (as decisões sobre tabelas e relacionamentos foram discutidas e tomadas pelo grupo), geração e teste do `schema.sql`, geração do `seed.sql` com dados fictícios, revisão do documento de justificativa dos índices. |
| **Prompts principais** | Pedidos para modelar as tabelas a partir das regras de negócio do PI; pedidos para gerar o `schema.sql` com índices e view; pedidos de revisão do documento da Entrega 1 (tom, contagem de tabelas, nomes dos índices). |
| **Trechos ou entregas afetadas** | `schema.sql` (tabelas, índices e a view `vw_relatorio_publicado`), `seed.sql`, documento de justificativa dos índices (Entrega 1) *[incluir o documento da view da Entrega 2, se foi feito com IA]*. |

### 2.3 Programação Orientada a Objetos

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | Claude – Claude Opus 5.5 |
| **Finalidade de uso** | Geração e explicação das classes do backend, em especial a classe `FluxoAcompanhamento`, que controla a mudança de status do acompanhamento. |
| **Prompts principais** | Pedidos para completar a API da Entrega 2 organizada em classes. |
| **Trechos ou entregas afetadas** | Classes da pasta `server/`, em especial `FluxoAcompanhamento`. |

### 2.4 Design de Interface Digital

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | Claude – Claude Opus 5.5 |
| **Finalidade de uso** | Análise dos wireframes em relação aos requisitos do PI, desenho dos fluxos de usuário, criação de uma referência visual das telas, elaboração do Guia de Estilo (cores, contraste, tipografia e componentes) e orientação do passo a passo no Figma. O layout no Figma foi montado pelo grupo. |
| **Prompts principais** | "Quais telas são necessárias para o wireframe do projeto?"; pedidos de ajuda com os User Flows de Professor, Administrador e cadastros; pedidos para transformar a referência visual em telas no Figma. |
| **Trechos ou entregas afetadas** | User Flows, documento "KFKA – Guia de estilo", referência visual das telas *[incluir a Análise de Usabilidade, se foi feita com IA]*. |

### 2.5 Estrutura de Dados

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | *[preencher: se o grupo usou IA na aplicação C#, informar aqui; caso contrário, escrever "Não houve uso de IA nesta disciplina"]* |
| **Finalidade de uso** | *[preencher]* |
| **Prompts principais** | *[preencher]* |
| **Trechos ou entregas afetadas** | *[preencher]* |

### 2.6 Banner e apresentação

| Campo | Informação |
| --- | --- |
| **Ferramenta / versão** | Claude – Claude Opus 5.5 |
| **Finalidade de uso** | Redação dos textos "Resumo do projeto" e "Tecnologias utilizadas" do banner, a partir das informações do projeto e no estilo de um banner anterior do grupo. |
| **Prompts principais** | "Consegue me montar um resumo nessa sessão que será usado de banner? Terá que conter um resumo do projeto, tecnologias utilizadas e tenha como base de escrita parecida com esse banner"; "Consegue gerar em inline em vez de lista". |
| **Trechos ou entregas afetadas** | Seções "Resumo do projeto" e "Tecnologias utilizadas" do banner. |

---

## 3. Declaração

Declaramos que o uso acima descrito está em conformidade com o **GUIA PARA O USO RESPONSÁVEL DE INTELIGÊNCIA ARTIFICIAL NA FECAP** e que o conteúdo final é de nossa plena responsabilidade autoral.

São Paulo, ___ de novembro de 2026.

| Integrante | RA |
| --- | --- |
| André Seiji Shiroma | 26029347 |
| Clayton Santos Ferreira | 26029419 |
| Marcos Almeida Daloia | 25027861 |
| Enzo Mancio | 25027739 |
