// Classe Jogo: orquestra tudo. Não sabe (nem precisa saber) o tipo
// exato de cada inimigo -- trata todos como "Inimigo" e chama os
// mesmos métodos (mover, tentarAtirar, desenhar). Cada um responde
// à sua própria maneira. Isso é polimorfismo em ação.
class Jogo {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.jogador = new Jogador(375, 550);
    this.inimigos = [];
    this.projeteisJogador = [];
    this.projeteisInimigo = [];

    this.pontos = 0;
    this.velocidadeBaseInimigos = 1;
    this.direcaoBloco = 1;
    this.rodando = true;

    this.teclas = {};
    this._configurarTeclado();
    this._criarOnda();
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  _configurarTeclado() {
    window.addEventListener('keydown', (e) => (this.teclas[e.code] = true));
    window.addEventListener('keyup', (e) => (this.teclas[e.code] = false));
  }

  // Monta uma fileira de inimigos misturando os 3 tipos criados.
  _criarOnda() {
    const linhas = [
      { tipo: InimigoAtirador, y: 40 },
      { tipo: InimigoRapido, y: 90 },
      { tipo: InimigoBasico, y: 140 },
      { tipo: InimigoBasico, y: 190 },
    ];

    linhas.forEach((linha) => {
      for (let i = 0; i < 8; i++) {
        const x = 60 + i * 80;
        // new linha.tipo(...) -> cada linha instancia uma subclasse diferente,
        // mas todas acabam guardadas na mesma lista "this.inimigos".
        this.inimigos.push(new linha.tipo(x, linha.y));
      }
    });
  }

  _tratarInput() {
    if (this.teclas['ArrowLeft']) this.jogador.mover(-1, this.canvas.width);
    if (this.teclas['ArrowRight']) this.jogador.mover(1, this.canvas.width);
    if (this.teclas['Space']) this.jogador.atirar(this.projeteisJogador);
  }

  _atualizarInimigos() {
    let bateuNaBorda = false;

    this.inimigos.forEach((inimigo) => {
      inimigo.direcao = this.direcaoBloco;
      // Chamada polimórfica: cada tipo de inimigo se move do seu jeito.
      inimigo.mover(this.velocidadeBaseInimigos, this.canvas.width);
      inimigo.tentarAtirar(this.projeteisInimigo);

      if (inimigo.x <= 0 || inimigo.x + inimigo.largura >= this.canvas.width) {
        bateuNaBorda = true;
      }
    });

    // Se algum inimigo bateu na borda, o bloco todo desce e inverte direção.
    if (bateuNaBorda) {
      this.direcaoBloco *= -1;
      this.inimigos.forEach((inimigo) => (inimigo.y += 20));
    }
  }

  _atualizarProjeteis() {
    [...this.projeteisJogador, ...this.projeteisInimigo].forEach((p) => p.atualizar());
    this.projeteisJogador = this.projeteisJogador.filter((p) => p.ativo);
    this.projeteisInimigo = this.projeteisInimigo.filter((p) => p.ativo);
  }

  _verificarColisoes() {
    // Tiro do jogador x inimigos
    this.projeteisJogador.forEach((projetil) => {
      this.inimigos.forEach((inimigo) => {
        if (projetil.ativo && inimigo.ativo && projetil.colideCom(inimigo)) {
          projetil.ativo = false;
          inimigo.ativo = false;
          this.pontos += inimigo.pontos;
        }
      });
    });
    this.inimigos = this.inimigos.filter((i) => i.ativo);
    this.projeteisJogador = this.projeteisJogador.filter((p) => p.ativo);

    // Tiro do inimigo x jogador
    this.projeteisInimigo.forEach((projetil) => {
      if (projetil.ativo && projetil.colideCom(this.jogador)) {
        projetil.ativo = false;
        this.jogador.vidas--;
      }
    });
    this.projeteisInimigo = this.projeteisInimigo.filter((p) => p.ativo);
  }

  _verificarFimDeJogo() {
    if (this.jogador.vidas <= 0) {
      this._finalizar('Você perdeu! Recarregue a página para jogar de novo.');
    } else if (this.inimigos.length === 0) {
      this._finalizar('Você venceu! Parabéns.');
    } else if (this.inimigos.some((i) => i.y + i.altura >= this.jogador.y)) {
      this._finalizar('Os invasores chegaram até você! Fim de jogo.');
    }
  }

  _finalizar(texto) {
    this.rodando = false;
    document.getElementById('mensagem').textContent = texto;
  }

  _desenhar() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.jogador.desenhar(ctx);
    this.inimigos.forEach((i) => i.desenhar(ctx));
    this.projeteisJogador.forEach((p) => p.desenhar(ctx));
    this.projeteisInimigo.forEach((p) => p.desenhar(ctx));

    document.getElementById('pontos').textContent = `Pontos: ${this.pontos}`;
    document.getElementById('vidas').textContent = `Vidas: ${this.jogador.vidas}`;
  }

  _loop() {
    if (!this.rodando) return;

    this._tratarInput();
    this.jogador.atualizar();
    this._atualizarInimigos();
    this._atualizarProjeteis();
    this._verificarColisoes();
    this._verificarFimDeJogo();
    this._desenhar();

    requestAnimationFrame(this._loop);
  }
}

// Inicia o jogo quando a página carrega.
window.addEventListener('load', () => new Jogo());
