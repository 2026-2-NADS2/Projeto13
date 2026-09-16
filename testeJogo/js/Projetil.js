// Projetil representa tanto o tiro do jogador quanto o tiro dos inimigos.
// O parâmetro "direcao" define se ele sobe (-1) ou desce (1) na tela.
class Projetil extends Entidade {
  constructor(x, y, direcao, cor = '#ffffff') {
    super(x, y, 4, 12, cor);
    this.velocidade = 7;
    this.direcao = direcao; // -1 = sobe (jogador), 1 = desce (inimigo)
  }

  atualizar() {
    this.y += this.velocidade * this.direcao;

    // Sai da tela -> desativa para ser removido do jogo
    if (this.y < 0 || this.y > 600) {
      this.ativo = false;
    }
  }
}
