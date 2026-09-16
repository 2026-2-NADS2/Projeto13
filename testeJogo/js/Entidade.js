// Classe base: define o que TODA entidade do jogo tem em comum
// (posição, tamanho e a capacidade de se desenhar e se atualizar).
// Jogador, Inimigo e Projetil herdam daqui.
class Entidade {
  constructor(x, y, largura, altura, cor) {
    this.x = x;
    this.y = y;
    this.largura = largura;
    this.altura = altura;
    this.cor = cor;
    this.ativo = true; // controla se a entidade ainda deve existir no jogo
  }

  // Método "genérico" de desenho. Pode ser sobrescrito (polimorfismo)
  // por classes filhas que precisem de um desenho diferente.
  desenhar(ctx) {
    ctx.fillStyle = this.cor;
    ctx.fillRect(this.x, this.y, this.largura, this.altura);
  }

  // Cada classe filha decide como se atualiza a cada frame.
  atualizar() {
    // Implementação vazia de propósito: as subclasses sobrescrevem.
  }

  // Colisão simples por retângulos (AABB), usada por todas as entidades.
  colideCom(outra) {
    return (
      this.x < outra.x + outra.largura &&
      this.x + this.largura > outra.x &&
      this.y < outra.y + outra.altura &&
      this.y + this.altura > outra.y
    );
  }
}
