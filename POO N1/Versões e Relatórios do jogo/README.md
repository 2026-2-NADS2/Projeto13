# Histórico de versões do jogo

Esta pasta guarda, **em ordem numérica**, cada atualização feita no Space Invaders ao longo do projeto. O número no nome da pasta é a ordem em que a mudança entrou no jogo, e o nome entre parênteses é de quem fez.

Cada pasta contém:

- um **`.zip` com o jogo completo** naquela etapa, que pode ser extraído e aberto pelo `index.html`;
- um **relatório** explicando o que mudou, os problemas encontrados e como foram resolvidos.

Cada versão parte da anterior, então a pasta **8** é a mais recente e reúne tudo o que foi feito antes.

## Linha do tempo

| # | Pasta | Responsável | O que mudou |
|---|---|---|---|
| 1 | Tela Start e Game Over | André | Criação da tela de início (com instruções e botão) e da tela de fim de jogo, com vitória/derrota e pontuação final. Nasce a classe `Tela`, que cuida só do que aparece por cima do canvas. |
| 2 | Escudos e Velocidade | Marcos | Inclusão dos escudos (barreiras que protegem a nave e se desgastam com os tiros) e ajuste da velocidade do jogo. |
| 3 | Botão de Pause e Sprites | Clayton | Pausa por botão e pelas teclas P/Esc, com tela de pausa. Os desenhos passam a ser pixel art (sprites com 2 quadros de animação). |
| 4 | Tela virada para Lateral | André | Mudança de rumo do jogo: a nave fica à esquerda, move-se nos 4 sentidos e os invasores avançam da direita para a esquerda. Passo fixo de 60 atualizações por segundo, para a velocidade não depender do monitor. |
| 5 | Adaptação de Escudos e Disparos para Lateral | Marcos | Ajuste dos escudos e dos tiros ao formato lateral: escudos bloqueiam todos os disparos, a nave não atravessa os escudos e as setas funcionam junto com o WASD. |
| 6 | Sistema de Hordas | André | Partida em 5 hordas (32, 40, 48, 56 e 60 invasores), cada uma com sua dificuldade. As vidas voltam a 3 a cada horda, os escudos continuam danificados e a vitória só vem após a horda 5. |
| 7 | Som e Música Direto no Navegador | Clayton | Efeitos sonoros e música de fundo gerados pela Web Audio API, sem arquivos de áudio. Teclas M (som) e N (música). Inclui também a redução de dificuldade da última horda. |
| 8 | Correção de Escudo e Dano Visual | Enzo | Correção no comportamento dos escudos e no efeito visual de dano. |

## Como usar

1. Entre na pasta da versão que quer ver.
2. Extraia o `.zip` (mantenha `index.html`, `style.css` e `js/` juntos).
3. Abra o `index.html` no navegador ou use o Live Server do VS Code.
4. Leia o relatório da mesma pasta para entender o que mudou naquela etapa.

Para ver a evolução, jogue as versões em sequência: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.

## Ferramentas e colaboração

Todas as versões foram construídas com apoio de IA (Claude, depois da primeira versão, em que também comparamos com o Gemini) e revisadas pelo grupo. Cada integrante gerou sua melhoria a partir da versão anterior e registrou o resultado no relatório da própria pasta.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![Canva](https://img.shields.io/badge/Canva-00C4CC?style=for-the-badge&logo=canva&logoColor=white)
