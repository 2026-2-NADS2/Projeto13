# Entregas do PI
### **DECLARAÇÃO DE USO DE INTELIGÊNCIA ARTIFICIAL**

**Projeto:** KFKA – Plataforma de Acompanhamento Escolar · 2º ADS · FECAP · 2026

> Em todos os usos, apenas o documento do PI, o código do grupo e os dados **fictícios** do `seed.sql` foram enviados à ferramenta. Nenhum dado real de alunos, responsáveis, professores ou da FECAP foi compartilhado (LGPD). Todo conteúdo gerado foi lido, testado e ajustado pelo grupo antes da entrega.

## Entrega 1
<br><br>

### Módulo do sistema 1

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma, Enzo Mancio |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Desenvolvimento Web Full Stack – Entrega 1 (front-end) |
| **Finalidade de uso** | Explicação da estrutura das páginas HTML dos três perfis, do servidor Express com a rota `GET /api/relatorios` e da conexão com o MySQL. |
| ***Prompts* principais utilizados** | Explicar como fazer as estruturas do (Administrador, Professor e Responsável), correções de estilos no css, pedidos de ajuda para conectar o Node.js ao MySQL. |
| **Trechos ou entregas afetadas** | `public/html/` (15 páginas), `server.js`, `db.js`, `.env.example`. |


### Módulo do sistema 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 1 (índices) |
| **Finalidade de uso** | Apoio na modelagem do `schema.sql`, geração dos dados fictícios do `seed.sql` e revisão do documento de índices. |
| ***Prompts* principais utilizados** | Pedidos para revisar o schema do KFKA e explicar quais colunas estão erradas e como melhorar. |
| **Trechos ou entregas afetadas** | `schema.sql` (seção de índices), `seed.sql`; documento de justificativa dos índices. |

### Módulo do sistema 3

| **Aluno(s) Responsável(veis)** | Clayton Santos Ferreira, André Seiji Shiroma e Marcos Almeida Daloia |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Design de Interface Digital – Entrega 1 (Guia de Estilo) |
| **Finalidade de uso** | Proposta de paleta de cores com verificação de contraste (WCAG), tipografia e regras de componentes para o Guia de Estilo. |
| ***Prompts* principais utilizados** | Pedidos para sugerir uma paleta de cores acessível para o KFKA, verificar o contraste entre as cores e sugerir fontes e regras para botões e campos. |
| **Trechos ou entregas afetadas** | Documento "KFKA – Guia de estilo". |

### Módulo do sistema 3

| **Aluno(s) Responsável(veis)** | Marcos Almeida Daloia |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Programação Orientada a Objetos – Entrega 2 (sistema funcionando na nuvem) |
| **Finalidade de uso** | Geração da classe `FluxoAcompanhamento`, que controla as transições de estado do acompanhamento e grava o histórico; a publicação do back-end na nuvem é a mesma da Web Full Stack (Módulo 1). Na pasta da entrega de POO, o aluno conduziu a entrega (manter o mesmo modelo de banco do grupo, organizar os arquivos e enviar ao repositório) e usou a IA como apoio para gerar e explicar a evolução do backend da Entrega 1: login com bcrypt e token JWT, registro de ciência do responsável, motivo obrigatório na devolução, listas de revisão e de acompanhamentos do professor e conexão segura (SSL) com o banco na nuvem. O funcionamento foi testado com o fluxo completo (rascunho → revisão → publicação → ciência). |
| ***Prompts* principais utilizados** | Os mesmos do Módulo 1 desta entrega; pedidos de ajuda para fazer a segunda entrega de POO usando o mesmo banco de dados do grupo e para colocar a entrega no GitHub. |
| **Trechos ou entregas afetadas** | `src/server/modelos/FluxoAcompanhamento.js`; pasta `Documentos/Entrega 2/Programação Orientada a Objetos` (`src/core/SistemaKFKA.js`, `src/core/Autenticador.js`, `src/models/Ciencia.js`, `src/repositories/`, `src/routes/index.js`, `src/config/database.js`, `scripts/criarBanco.js`, `README.md`). |
### Módulo do sistema 5

| **Aluno(s) Responsável(veis)** | Enzo Mancio Vaz |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Estrutura de Dados |
| **Finalidade de uso** | Adaptar nossa estrutura de banco de dados (MySQL) para outra estrutura (SQLite), e dar a devida finalidade aos requisitos da matéria.|
| ***Prompts* principais utilizados** | Adaptação do meu banco de dados para sintaxes do SQLite, e ideias para conseguir realizar a entrega com um código mais curto. |
| **Trechos ou entregas afetadas** |   |

## Entrega 2
<br><br>

### Módulo do sistema 1

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma, Enzo Mancio Vaz|
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Desenvolvimento Web Full Stack – Entrega 2 (back-end e publicação) |
| **Finalidade de uso** | Como conectar a API no Node.js + Express + MySQL (rotas dos três perfis, login com JWT, proteção por perfil e por vínculo, validação e erros padronizados), ajuda na migração do front-end de HTML/JS para React, a pedido do professor, ajuda no passo a passo de deploy seguindo a Aula 13 (MySQL no Railway, API no Render, site no Netlify) |
| ***Prompts* principais utilizados** | "Preciso da sua ajuda para deixar o site no ar usando o Netlify, Railway e Render", ajuda na criação e reset de senhas criadas pelo Railway e Render|
| **Trechos ou entregas afetadas** | `src/server/` (`middlewares/autenticacao.js`, `rotas/usuarios.js`, `render.yaml`), `src/client/` (aplicação React, `netlify.toml`, `.env.production`), `src/README.md`. Decisões tomadas: cadastro feito só pelo administrador (e não aberto, por causa da LGPD), troca do Aiven pelo Railway e uso de um repositório espelho para o deploy. |


### Módulo do sistema 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 2 (view) |
| **Finalidade de uso** | Conferência se o arquivo `schema.sql` (tabela `ciencia` e coluna `historico.observacao`) esta correto com a nova atualização de dados, ajuda na explicação do código para a documentação word
| ***Prompts* principais utilizados** | "Preciso da sua ajuda se a nova atualização do banco de dados esta correto e se ainda esta conversando normalmente com sistema", "Me ajude se esse documento word tem algum erro ortográfico e quais sugestões de melhorias no texto"|
| **Trechos ou entregas afetadas** | `src/banco/schema.sql`, `src/banco/seed.sql`; documento da view da Entrega 2. |

### Módulo do sistema 3

| **Aluno(s) Responsável(veis)** | Marcos Almeida Daloia |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Programação Orientada a Objetos – Entrega 2 (sistema funcionando na nuvem) |
| **Finalidade de uso** | Geração da classe `FluxoAcompanhamento`, que controla as transições de estado do acompanhamento e grava o histórico; a publicação do back-end na nuvem é a mesma da Web Full Stack (Módulo 1). Na pasta da entrega de POO, o aluno conduziu a entrega (manter o mesmo modelo de banco do grupo, organizar os arquivos e enviar ao repositório) e usou a IA como apoio para gerar e explicar a evolução do backend da Entrega 1: login com bcrypt e token JWT, registro de ciência do responsável, motivo obrigatório na devolução, listas de revisão e de acompanhamentos do professor e conexão segura (SSL) com o banco na nuvem. O funcionamento foi testado com o fluxo completo (rascunho → revisão → publicação → ciência). |
| ***Prompts* principais utilizados** | Os mesmos do Módulo 1 desta entrega; pedidos de ajuda para fazer a segunda entrega de POO usando o mesmo banco de dados do grupo e para colocar a entrega no GitHub. |
| **Trechos ou entregas afetadas** | `src/server/modelos/FluxoAcompanhamento.js`; pasta `Documentos/Entrega 2/Programação Orientada a Objetos` (`src/core/SistemaKFKA.js`, `src/core/Autenticador.js`, `src/models/Ciencia.js`, `src/repositories/`, `src/routes/index.js`, `src/config/database.js`, `scripts/criarBanco.js`, `README.md`). |
### Módulo do sistema 4

| **Aluno(s) Responsável(veis)** | Clayton Santos Ferreira, André Seiji Shiroma e Marcos Almeida Daloia |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai; gerador de imagens do Figma (IA) para as ilustrações |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Design de Interface Digital – Entrega 2 (mapa de navegação, protótipo navegável e Design System) e atividades de Personas e Brand Persona |
| **Finalidade de uso** | Orientação passo a passo de como usar o Figma (quadros, textos, setas e ligações do protótipo); sugestão da estrutura do mapa de navegação, da Tela inicial e das partes do Design System (cores dos status, escala de tipografia, espaçamentos, cantos e ícones); escrita do texto da Brand Persona (Kika); geração das ilustrações da Kika e das personas. A montagem no Figma foi feita pelo grupo, e as telas já existentes foram mantidas, mudando só as cores para o padrão do Guia de Estilo. As imagens geradas por IA estão identificadas no arquivo. |
| ***Prompts* principais utilizados** | Pedidos de explicação passo a passo de como montar cada parte no Figma; pedido para escrever o texto da Brand Persona; pedidos de ajuda para criar o mapa de navegação, a Tela inicial e o Design System. |
| **Trechos ou entregas afetadas** | Arquivo Figma "Nova Stark": páginas Mapa de navegação, Protótipo (Tela inicial e ligações entre as telas), design System, Brand Persona e Persona; pasta `Documentos/Entrega 2/Design de Interface Digital` (PDF exportado). |

***Declaro que o uso acima descrito está em conformidade com o GUIA PARA O USO RESPONSÁVEL DE
INTELIGÊNCIA ARTIFICIAL NA FECAP e que o conteúdo final é de minha plena responsabilidade
autoral.***
