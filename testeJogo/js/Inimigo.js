// Inimigo é a classe base para todos os tipos de invasor.
// Ela guarda o que é comum (movimento em bloco, pontos, vida)
// e deixa o comportamento específico (atualizar / atirar) para as
// subclasses sobrescreverem -> é aqui que o POLIMORFISMO acontece:
// o Jogo trata todo mundo como "Inimigo", mas cada um se comporta diferente.
class Inimigo extends Entidade {
  constructor(x, y, largura, altura, cor, pontos) {
    super(x, y, largura, altura, cor);
    this.pontos = pontos;
    this.direcao = 1; // 1 = direita, -1 = esquerda (movimento em bloco)
  }

  // Comportamento padrão de movimento em bloco (usado como base;
  // as subclasses podem chamar super.mover() e completar com o extra delas).
  mover(velocidadeBase, larguraCanvas, alturaQueda) {
    this.x += velocidadeBase * this.direcao;

    // Se bateu na borda, quem chama esse método decide inverter a direção
    // e descer a fileira toda (isso fica no Jogo.js, pois afeta o grupo inteiro).
  }

  // Método "gancho" que cada subclasse pode sobrescrever para atirar
  // com sua própria lógica/chance. Por padrão, um inimigo comum não atira.
  tentarAtirar(listaProjeteis) {
    // Implementação vazia: nem todo inimigo atira.
  }
}
