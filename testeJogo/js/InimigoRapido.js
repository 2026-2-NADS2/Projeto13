// Inimigo rápido: sobrescreve mover() para se deslocar mais rápido
// que o padrão herdado de Inimigo. Vale mais pontos por ser mais difícil de acertar.
class InimigoRapido extends Inimigo {
  constructor(x, y) {
    super(x, y, 28, 22, '#ffd633', 20);
    this.multiplicadorVelocidade = 2;
  }

  // Sobrescreve o mover() da classe pai: mesma ideia, porém mais rápido.
  mover(velocidadeBase, larguraCanvas) {
    this.x += velocidadeBase * this.multiplicadorVelocidade * this.direcao;
  }
}
