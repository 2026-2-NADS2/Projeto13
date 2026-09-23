// Classe ABSTRATA: não pode ser instanciada diretamente.
// Administrador, Professor e Responsavel herdam dela (HERANÇA)
// e sobrescrevem "perfil" e "permissoes" (POLIMORFISMO).
class Usuario {
  #senhaHash; // atributo privado (ENCAPSULAMENTO): nunca sai na resposta da API

  constructor({ id, nome, email, senhaHash, ativo = true }) {
    if (new.target === Usuario) {
      throw new Error('Usuario é abstrata; use Administrador, Professor ou Responsavel');
    }
    this.id = id;
    this.nome = nome;
    this.email = email;
    this.#senhaHash = senhaHash;
    this.ativo = Boolean(ativo);
  }

  get perfil() {
    throw new Error('A subclasse deve implementar o perfil');
  }

  get permissoes() {
    return [];
  }

  temPermissao(permissao) {
    return this.ativo && this.permissoes.includes(permissao);
  }

  // Controla o que aparece quando o objeto vira JSON (a senha fica de fora)
  toJSON() {
    return { id: this.id, nome: this.nome, email: this.email, perfil: this.perfil, ativo: this.ativo };
  }
}

module.exports = Usuario;
