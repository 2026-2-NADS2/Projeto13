// Inimigo mais simples: só anda em bloco, sem atirar, vale poucos pontos.
class InimigoBasico extends Inimigo {
  constructor(x, y) {
    super(x, y, 32, 24, '#ff5050', 10);
  }
  // Não precisa sobrescrever mover() nem tentarAtirar():
  // herda o comportamento padrão da classe Inimigo.
}
