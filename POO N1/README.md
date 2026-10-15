# Space Invaders Lateral

Jogo no estilo Space Invaders, feito em **JavaScript puro + HTML5 `<canvas>`**, com a nave à esquerda e os invasores avançando da direita para a esquerda. Projeto de grupo da NI1 de **Programação Orientada a Objetos** (turma 2 NAADS), com foco em classes, herança e polimorfismo.

## Integrantes

- André Seiji Shiroma 
- Marcos Almeida Daloia
- Clayton Santos Ferreira
- Enzo Mancio

## Como executar

Não precisa instalar nada nem usar servidor.

1. Extraia o `.zip` mantendo `index.html`, `style.css` e a pasta `js/` juntos.
2. Abra o `index.html` em qualquer navegador moderno (Chrome, Edge ou Firefox).
   - Alternativa: no VS Code, clique com o botão direito em `index.html` → **Open with Live Server**.
3. Clique em **Iniciar jogo** ou aperte **Enter**.

> O som e a música usam a Web Audio API (sem arquivos de áudio). O navegador só libera o áudio depois do primeiro clique ou tecla, por isso o som começa ao iniciar o jogo.

## Controles

| Tecla | Ação |
|---|---|
| Setas ou **W A S D** | Mover a nave nos 4 sentidos (na diagonal a velocidade é compensada) |
| **Espaço** | Atirar |
| **P** ou **Esc** | Pausar / continuar |
| **M** | Liga/desliga os efeitos sonoros |
| **N** | Liga/desliga a música de fundo |
| **F** | Tela cheia |
| **Enter** | Iniciar / jogar novamente |

## Regras do jogo

- Você controla uma nave à esquerda. Os invasores ficam em colunas, sobem e descem e, ao bater na borda, **avançam para a esquerda**.
- **Derrota:** perder as 3 vidas ou algum invasor chegar à borda esquerda.
- **Vitória:** eliminar todas as **5 hordas**.
- A cada horda as **vidas voltam para 3**, mas os **escudos continuam danificados** e a **pontuação acumula**.
- Os **escudos** bloqueiam todos os tiros (aguentam 3 acertos, escurecendo a cada dano) e a nave **não consegue atravessá-los**.
- O jogo roda com **passo fixo de 60 atualizações por segundo**, então a velocidade é a mesma em qualquer monitor.

### Invasores

| Tipo | Pontos | Comportamento |
|---|---|---|
| Básico | 10 | Só se move |
| Rápido | 20 | Move-se mais depressa |
| Atirador | 30 | Dispara projéteis contra o jogador |

### Hordas

| Horda | Colunas | Invasores | Atiradores |
|---|---|---|---|
| 1 | 4 | 32 | 16 |
| 2 | 5 | 40 | 24 |
| 3 | 6 | 48 | 32 |
| 4 | 7 | 56 | 40 |
| 5 | 6 (10 por coluna) | 60 | 40 |

A horda 5 foi suavizada (6 colunas, movimento mais lento e tiros menos frequentes) para ser possível vencer em telas de tamanhos diferentes.

## Estrutura do projeto

```
index.html        Página, canvas, HUD e tela por cima (overlay)
style.css         Estilo e layout responsivo
js/
  Entidade.js         Classe base: posição, tamanho, desenhar() e mover()
  Jogador.js          Nave do jogador (movimento em 4 eixos, vidas, tiro)
  Projetil.js         Tiros do jogador e dos inimigos
  Barreira.js         Escudos (3 acertos, escurecem; Barreira.criarEscudo())
  Inimigo.js          Classe base dos invasores
  InimigoBasico.js    Invasor básico (10 pts)
  InimigoRapido.js    Invasor rápido (20 pts)
  InimigoAtirador.js  Invasor que atira (30 pts)
  Sprites.js          Pixel art em mapas de texto, com 2 quadros de animação
  Tela.js             Tela de início, pausa, aviso de horda e fim de jogo
  Jogo.js             Laço principal, regras, colisões e tabela de hordas
  Som.js              Efeitos sonoros (Web Audio API)
  Musica.js           Música de fundo em loop (Web Audio API)
```

A ordem das tags `<script>` no `index.html` respeita as dependências (não usa módulos ES).

## Conceitos de POO aplicados

- **Classes e objetos:** cada elemento do jogo é uma classe (`Jogador`, `Projetil`, `Barreira`, `Inimigo`…).
- **Herança (2 níveis):** `Entidade` → `Inimigo` → `InimigoBasico` / `InimigoRapido` / `InimigoAtirador`. `Jogador`, `Projetil` e `Barreira` também herdam de `Entidade`.
- **Polimorfismo:** `mover()`, `tentarAtirar()` e `desenhar()` são sobrescritos nas subclasses. O `Jogo` chama o mesmo método em todos os inimigos e cada tipo reage do seu jeito (só o atirador dispara).
- **Encapsulamento:** `Tela` esconde o acesso ao DOM; `Barreira.receberDano()` controla a vida do escudo.
- **Membros estáticos:** `Jogo.HORDAS`, `Jogo.SETAS_PARA_WASD`, `Barreira.criarEscudo()`.
- **Composição:** `Jogo` possui `Tela`, `Som` e `Musica`; `Musica` usa `Som`.
- **Responsabilidade única:** o `Jogo` cuida das regras, a `Tela` das mensagens, `Som`/`Musica` do áudio.

## Como o jogo evoluiu

1. Versão base gerada com IA (Claude e Gemini comparados; seguimos com o Claude).
2. Escudos e ajuste de velocidade.
3. Tela de início e tela de game over.
4. Pausa e sprites em pixel art.
5. Mudança para o formato lateral, com movimento em 4 eixos.
6. Correções da versão lateral (setas/escudos e passo fixo).
7. Sistema de 5 hordas.
8. Som, música e ajuste de dificuldade.
9. Redução da horda 5 de 8 para 6 colunas.

## Uso de IA

Foram usados **Gemini** e **Claude** na primeira versão do jogo e os resultados foram comparados. O Gemini gerou uma versão muito simples; o Claude entregou uma base mais completa e organizada. Com a concordância do professor, o grupo seguiu **só com o Claude** nas melhorias seguintes. O código foi revisado e testado pelo grupo.

## Créditos

- Jogo original **Space Invaders** (Taito, 1978), usado apenas como inspiração de jogabilidade.
- *Fix Your Timestep!*, de Glenn Fiedler: referência para o laço de passo fixo.
- Documentação da **Web Audio API** (MDN Web Docs): referência para sons e música.
- Código gerado e revisado com **Claude** (Anthropic) e **Gemini** (Google).
- Editado com **VS Code** + extensão **Live Server**.
- Nenhuma imagem, som ou biblioteca de terceiros: os sprites são mapas de texto e os sons são sintetizados no código.

  ## link dos nossos slides: https://canva.link/v2xq5tk5ny1wyuj
