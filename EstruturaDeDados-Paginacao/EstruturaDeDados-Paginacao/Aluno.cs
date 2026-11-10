using System;
using System.Collections.Generic;
using System.Text;


namespace KFKA_ListaAlunos
{
    internal class Aluno
    {
        public string Nome { get; set; } = string.Empty;
        public DateOnly DataNascimento { get; set; }
        public string Turma { get; set; } = string.Empty;
        public bool Ativo { get; set; }

        public Aluno()
        {
        }

        public Aluno(string nome, DateOnly dataNascimento, string turma, bool ativo)
        {
            Nome = nome;
            DataNascimento = dataNascimento;
            Turma = turma;
            Ativo = ativo;
        }

        public override string ToString()
        {
            string status = Ativo ? "Ativo" : "Inativo";
            return $"{Nome} ; {DataNascimento:dd.MM.yyyy} ; {Turma} ; {status}";
        }
    }
}
