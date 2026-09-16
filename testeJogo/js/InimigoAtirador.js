// Inimigo atirador: sobrescreve tentarAtirar() para de fato disparar
// projéteis contra o jogador, algo que o Inimigo base não faz.
class InimigoAtirador extends Inimigo {
  constructor(x, y) {
    super(x, y, 32, 24, '#c266ff', 30);
    this.chanceDeAtirar = 0.002; // chance por frame de disparar
  }

  tentarAtirar(listaProjeteis) {
    if (Math.random() < this.chanceDeAtirar) {
      const centroX = this.x + this.largura / 2 - 2;
      listaProjeteis.push(new Projetil(centroX, this.y + this.altura, 1, '#c266ff'));
    }
  }
}
