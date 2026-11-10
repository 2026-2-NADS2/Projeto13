using Microsoft.Data.Sqlite;
using System.Globalization;

namespace KFKA_ListaAlunos
{
    internal class AlunoDB
    {
        private readonly string _connectionString;

        public AlunoDB(string caminhoBanco)
        {
            _connectionString = $"Data Source={caminhoBanco}";
            CriarTabelaSeNaoExistir();
        }

        private void CriarTabelaSeNaoExistir()
        {
            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                CREATE TABLE IF NOT EXISTS Aluno (
                    Nome            TEXT    NOT NULL PRIMARY KEY,
                    DataNascimento  TEXT    NOT NULL,
                    Turma           TEXT    NOT NULL,
                    Ativo           INTEGER NOT NULL
                );
            ";
            comando.ExecuteNonQuery();
        }

        public void Inserir(Aluno item)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));

            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                INSERT INTO Aluno (Nome, DataNascimento, Turma, Ativo)
                VALUES (@nome, @dataNascimento, @turma, @ativo);
            ";
            comando.Parameters.AddWithValue("@nome", item.Nome);
            comando.Parameters.AddWithValue("@dataNascimento", ParaTextoBanco(item.DataNascimento));
            comando.Parameters.AddWithValue("@turma", item.Turma);
            comando.Parameters.AddWithValue("@ativo", item.Ativo ? 1 : 0);

            comando.ExecuteNonQuery();
        }

        public void Atualizar(Aluno item)
        {
            if (item == null) throw new ArgumentNullException(nameof(item));

            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                UPDATE Aluno
                   SET DataNascimento = @dataNascimento,
                       Turma          = @turma,
                       Ativo          = @ativo
                 WHERE Nome = @nome;
            ";
            comando.Parameters.AddWithValue("@nome", item.Nome);
            comando.Parameters.AddWithValue("@dataNascimento", ParaTextoBanco(item.DataNascimento));
            comando.Parameters.AddWithValue("@turma", item.Turma);
            comando.Parameters.AddWithValue("@ativo", item.Ativo ? 1 : 0);

            comando.ExecuteNonQuery();
        }

        public void Excluir(string nome)
        {
            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                DELETE FROM Aluno
                 WHERE Nome = @nome;
            ";
            comando.Parameters.AddWithValue("@nome", nome);

            comando.ExecuteNonQuery();
        }

        public Aluno? ObterPorNome(string nome)
        {
            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                SELECT Nome, DataNascimento, Turma, Ativo
                  FROM Aluno
                 WHERE Nome = @nome;
            ";
            comando.Parameters.AddWithValue("@nome", nome);

            using var reader = comando.ExecuteReader();

            if (reader.Read())
            {
                return new Aluno
                {
                    Nome = reader.GetString(0),
                    DataNascimento = DeTextoBanco(reader.GetString(1)),
                    Turma = reader.GetString(2),
                    Ativo = reader.GetInt32(3) == 1
                };
            }

            return null;
        }

        public List<Aluno> ObterTodos()
        {
            var lista = new List<Aluno>();

            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                SELECT Nome, DataNascimento, Turma, Ativo
                  FROM Aluno
              ORDER BY Nome;
            ";

            string nome;
            DateOnly dataNascimento;
            string turma;
            bool ativo;
            Aluno aluno;

            using var reader = comando.ExecuteReader();
            while (reader.Read())
            {
                nome = reader.GetString(0);
                dataNascimento = DeTextoBanco(reader.GetString(1));
                turma = reader.GetString(2);
                ativo = reader.GetInt32(3) == 1;
                aluno = new Aluno(nome, dataNascimento, turma, ativo);
                lista.Add(aluno);
            }

            return lista;
        }

        public List<Aluno> ObterComNomeIgualOuSuperior(string nome)
        {
            var lista = new List<Aluno>();

            using var conexao = new SqliteConnection(_connectionString);
            conexao.Open();

            //alteração, filtrar apenas nome e parecidos
            using var comando = conexao.CreateCommand();
            comando.CommandText = @"
                SELECT Nome, DataNascimento, Turma, Ativo
                  FROM Aluno
                 WHERE Nome like @nome
              ORDER BY Nome;
            ";
            comando.Parameters.AddWithValue("@nome", nome + "%");

            string nomeAtual;
            DateOnly dataNascimento;
            string turma;
            bool ativo;
            Aluno aluno;

            using var reader = comando.ExecuteReader();
            while (reader.Read())
            {
                nomeAtual = reader.GetString(0);
                dataNascimento = DeTextoBanco(reader.GetString(1));
                turma = reader.GetString(2);
                ativo = reader.GetInt32(3) == 1;
                aluno = new Aluno(nomeAtual, dataNascimento, turma, ativo);
                lista.Add(aluno);
            }

            return lista;
        }

        public void InserirOuAtualizar(Aluno item)
        {
            var existente = ObterPorNome(item.Nome);

            if (existente == null)
                Inserir(item);
            else
                Atualizar(item);
        }

        private static string ParaTextoBanco(DateOnly data)
        {
            return data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }

        private static DateOnly DeTextoBanco(string texto)
        {
            return DateOnly.ParseExact(texto, "yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
    }
}