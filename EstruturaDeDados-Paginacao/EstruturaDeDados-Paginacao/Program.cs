using KFKA_ListaAlunos;
using System.Globalization;

Console.OutputEncoding = System.Text.Encoding.UTF8;

string caminhoCsv = @"..\..\..\ALUNOS.csv";
string caminhoBanco = @"..\..\..\KFKA_Alunos.db";
var repositorio = new AlunoDB(caminhoBanco);

Console.WriteLine("=== KFKA - Importação e Paginação de Alunos ===");
Console.WriteLine($"Banco SQLite: {caminhoBanco}");
Console.WriteLine();

if (!File.Exists(caminhoCsv))
{
    Console.WriteLine("Arquivo CSV não encontrado.");
    return;
}

int quantidadeImportada = ImportarCsv(caminhoCsv, repositorio);

Console.WriteLine();
Console.WriteLine($"Importação concluída. Registros processados: {quantidadeImportada}");
Console.WriteLine();

List<Aluno> alunos = repositorio.ObterTodos();
const int tamanhoPagina = 5;
int totalPaginas = (int)Math.Ceiling(alunos.Count / (double)tamanhoPagina);
int paginaAtual = 1;

Console.WriteLine($"Total de alunos: {alunos.Count} | Tamanho de página: {tamanhoPagina} | Total de páginas: {totalPaginas}");
MostrarPagina(ObterPagina(alunos, paginaAtual, tamanhoPagina), paginaAtual, totalPaginas);

bool executando = true;
while (executando)
{
    Console.WriteLine();
    Console.WriteLine("[N] Próxima página   [P] Página anterior   [I] Ir para página");
    Console.WriteLine("[F] Filtrar por nome (a partir de...)   [S] Encerrar");
    Console.Write("Escolha uma opção: ");
    string opcao = (Console.ReadLine() ?? "").Trim().ToUpperInvariant();

    switch (opcao)
    {
        case "N":
            if (paginaAtual < totalPaginas) paginaAtual++;
            MostrarPagina(ObterPagina(alunos, paginaAtual, tamanhoPagina), paginaAtual, totalPaginas);
            break;

        case "P":
            if (paginaAtual > 1) paginaAtual--;
            MostrarPagina(ObterPagina(alunos, paginaAtual, tamanhoPagina), paginaAtual, totalPaginas);
            break;

        case "I":
            Console.Write("Número da página: ");
            if (int.TryParse(Console.ReadLine(), out int numero) && numero >= 1 && numero <= totalPaginas)
            {
                paginaAtual = numero;
                MostrarPagina(ObterPagina(alunos, paginaAtual, tamanhoPagina), paginaAtual, totalPaginas);
            }
            else
            {
                Console.WriteLine("Número inválido.");
            }
            break;

        case "F":
            Console.Write("Digite o nome (ou parte inicial) para filtrar: ");
            string entradaNome = (Console.ReadLine() ?? "").Trim();
            List<Aluno> filtrados = repositorio.ObterComNomeIgualOuSuperior(entradaNome);

            Console.WriteLine();
            Console.WriteLine($"Alunos com nome >= \"{entradaNome}\"");
            Console.WriteLine(new string('-', 40));

            if (filtrados.Count == 0)
            {
                Console.WriteLine("Nenhum registro encontrado.");
            }
            else
            {
                foreach (var item in filtrados)
                {
                    Console.WriteLine(item);
                }
            }
            break;

        case "S":
            executando = false;
            break;

        default:
            Console.WriteLine("Opção inválida.");
            break;
    }
}

Console.WriteLine();
Console.WriteLine("Encerrado");


Aluno convert(string[] item)
{
    string nome = item[0];
    DateOnly dataNascimento = DateOnly.ParseExact(item[1], "dd.MM.yyyy", CultureInfo.InvariantCulture);
    string turma = item[2];
    bool ativo = item[3].Trim().Equals("Sim", StringComparison.OrdinalIgnoreCase);

    return new Aluno(nome, dataNascimento, turma, ativo);
}

int ImportarCsv(string caminho, AlunoDB appDB)
{
    int contador = 0;
    if (File.Exists(caminho))
    {
        using (StreamReader sr = new StreamReader(caminho))
        {
            string? linha = sr.ReadLine(); // Desconsidera cabeçalho
            while ((linha = sr.ReadLine()) != null)
            {
                string[] item = linha.Split(';');

                Aluno aluno = convert(item);
                appDB.InserirOuAtualizar(aluno);
                contador++;
            }
        }
    }
    return contador;
}

List<Aluno> ObterPagina(List<Aluno> lista, int numeroPagina, int tamanho)
{
    int indiceInicial = (numeroPagina - 1) * tamanho;
    int indiceFinal = Math.Min(indiceInicial + tamanho, lista.Count);

    var pagina = new List<Aluno>();
    for (int i = indiceInicial; i < indiceFinal; i++)
    {
        pagina.Add(lista[i]);
    }
    return pagina;
}

void MostrarPagina(List<Aluno> pagina, int numeroPagina, int totalPaginas)
{
    Console.WriteLine();
    Console.WriteLine($"--- Página {numeroPagina} de {totalPaginas} ---");
    foreach (var aluno in pagina)
    {
        Console.WriteLine(aluno);
    }
}
