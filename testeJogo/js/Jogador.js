// Jogador herda de Entidade e adiciona comportamento próprio:
// mover-se com o teclado e atirar.
class Jogador extends Entidade {
  constructor(x, y) {
    super(x, y, 50, 20, '#7CFC00');
    this.velocidade = 6;
    this.vidas = 3;
    this.cooldownTiro = 0; // evita metralhar tiros infinitos
  }

  mover(direcao, larguraCanvas) {
    this.x += this.velocidade * direcao;

    // Não deixa o jogador sair da tela
    if (this.x < 0) this.x = 0;
    if (this.x + this.largura > larguraCanvas) {
      this.x = larguraCanvas - this.largura;
    }
  }

  atirar(listaProjeteis) {
    if (this.cooldownTiro > 0) return;

    const centroX = this.x + this.largura / 2 - 2;
    listaProjeteis.push(new Projetil(centroX, this.y - 12, -1, '#7CFC00'));
    this.cooldownTiro = 15; // frames até poder atirar de novo
  }

  // Sobrescreve atualizar() da classe base: além de existir,
  // o jogador precisa contar o cooldown do tiro a cada frame.
  atualizar() {
    if (this.cooldownTiro > 0) this.cooldownTiro--;
  }
}
