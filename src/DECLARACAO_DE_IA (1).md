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
| **Finalidade de uso** | Geração e explicação da estrutura das páginas HTML dos três perfis, do servidor Express com a rota `GET /api/relatorios` e da conexão com o MySQL; elaboração do guia "KFKA – Guia das páginas HTML para CSS e JS". |
| ***Prompts* principais utilizados** | Pedidos para montar as páginas HTML de cada perfil (Administrador, Professor e Responsável), com comentários explicando cada elemento; pedidos de ajuda para conectar o Node.js ao MySQL. |
| **Trechos ou entregas afetadas** | `public/html/` (15 páginas), `server.js`, `db.js`, `.env.example`; documento "KFKA – Guia das páginas HTML para CSS e JS". |


### Módulo do sistema 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 1 (índices) |
| **Finalidade de uso** | Apoio na modelagem do `schema.sql`, geração dos dados fictícios do `seed.sql` e revisão do documento de justificativa dos índices. |
| ***Prompts* principais utilizados** | Pedidos para revisar o schema do KFKA e explicar quais colunas deveriam ter índice e por quê. |
| **Trechos ou entregas afetadas** | `schema.sql` (seção de índices), `seed.sql`; documento de justificativa dos índices. |

### Módulo do sistema 3

| **Aluno(s) Responsável(veis)** | [preencher] |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Design de Interface Digital – Entrega 1 (Guia de Estilo) |
| **Finalidade de uso** | Proposta de paleta de cores com verificação de contraste (WCAG), tipografia e regras de componentes para o Guia de Estilo. |
| ***Prompts* principais utilizados** | [preencher] |
| **Trechos ou entregas afetadas** | Documento "KFKA – Guia de estilo". |

## Entrega 2
<br><br>

### Módulo do sistema 1

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma, Enzo Mancio |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Desenvolvimento Web Full Stack – Entrega 2 (back-end e publicação) |
| **Finalidade de uso** | (1) Geração da API completa em Node.js + Express + MySQL (rotas dos três perfis, login com JWT, proteção por perfil e por vínculo, validação e erros padronizados); (2) migração do front-end de HTML/JS para React, a pedido do professor; (3) cadastro de usuários pelo administrador (bcrypt, 409 para e-mail repetido); (4) arquivos e passo a passo de deploy seguindo a Aula 13 (MySQL no Railway, API no Render, site no Netlify); (5) testes automatizados da API e no navegador; (6) README do projeto. |
| ***Prompts* principais utilizados** | "Seguinte, eu esqueci de colocar o React nesse arquivo zip, estou te mandando também o schema para você fazer os testes depois de colocar o React"; "Com base no documento da PI de web full stack da segunda entrega e dos requisitos em geral do projeto, o que está faltando?"; "Estou te mandando arquivos zip do que [o professor] usou no VS Code para dar na aula […] vamos montar com base no que o professor está pedindo"; "Vamos gerar um README, mas explicando primeiro que eu precisei fazer em um repositório separado porque precisa esperar pela autorização do administrador para fazer o deploy". |
| **Trechos ou entregas afetadas** | `src/server/` (todas as rotas, `middlewares/autenticacao.js`, `rotas/usuarios.js`, `render.yaml`), `src/client/` (aplicação React, `netlify.toml`, `.env.production`), `src/README.md`. Decisões tomadas pelo grupo: cadastro feito só pelo administrador (e não aberto, por causa da LGPD), troca do Aiven pelo Railway e uso de um repositório espelho para o deploy. |


### Módulo do sistema 2

| **Aluno(s) Responsável(veis)** | André Seiji Shiroma |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Banco de Dados – Entrega 2 (view) |
| **Finalidade de uso** | Atualização do `schema.sql` (tabela `ciencia` e coluna `historico.observacao`) e do `seed.sql`; geração do documento que explica a view `vw_relatorio_publicado`, com resultados reais da consulta no banco de teste; conferência final dos arquivos antes do envio. |
| ***Prompts* principais utilizados** | Pedido para gerar o documento da view no mesmo modelo do documento da Entrega 1; pedido para conferir o `schema.sql`, o `seed.sql` e o PDF antes do envio. |
| **Trechos ou entregas afetadas** | `src/banco/schema.sql`, `src/banco/seed.sql`; documento da view da Entrega 2. |

### Módulo do sistema 3

| **Aluno(s) Responsável(veis)** | [preencher] |
| :--- | :--- |
| **Ferramenta utilizada** | Claude (Anthropic), pelo site claude.ai |
| **Versão/modelo** | Claude Opus 5.5 |
| **Disciplina / Trabalho** | Programação Orientada a Objetos – Entrega 2 (sistema funcionando na nuvem) |
| **Finalidade de uso** | Geração da classe `FluxoAcompanhamento`, que controla as transições de estado do acompanhamento e grava o histórico; a publicação do back-end na nuvem é a mesma da Web Full Stack (Módulo 1). |
| ***Prompts* principais utilizados** | Os mesmos do Módulo 1 desta entrega. |
| **Trechos ou entregas afetadas** | `src/server/modelos/FluxoAcompanhamento.js`. |

***Declaro que o uso acima descrito está em conformidade com o GUIA PARA O USO RESPONSÁVEL DE
INTELIGÊNCIA ARTIFICIAL NA FECAP e que o conteúdo final é de minha plena responsabilidade
autoral.***
