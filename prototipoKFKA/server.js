// ============================================================
// KFKA - Plataforma de Acompanhamento Escolar
// Arquivo: server.js
// Descrição: ponto de entrada do backend. Cria o servidor Express,
// entrega as páginas do front-end (pasta public), define as rotas
// da API e trata endereços inexistentes (erro 404).
// Para iniciar: node server.js
// ============================================================

// Importa o módulo "path", que já vem com o Node.js. Ele monta
// caminhos de arquivos do jeito certo em qualquer sistema
// operacional (Windows usa "\" e Linux/Mac usam "/").
const path = require('path');

// Importa o Express, o framework que cria o servidor web e as rotas.
const express = require('express');

// Importa o pool de conexões com o MySQL, configurado no arquivo db.js.
// "Pool" é um conjunto de conexões reaproveitáveis: em vez de abrir e
// fechar uma conexão a cada consulta, o sistema pega uma livre do pool.
const pool = require('./db');

// Cria a aplicação Express. É nela que registramos as rotas.
const app = express();

// Porta em que o servidor vai "escutar" os pedidos (localhost:3000).
const PORT = 3000;

// ============================================================
// ARQUIVOS ESTÁTICOS (front-end)
// ============================================================

// Entrega automaticamente os arquivos da pasta "public" (HTML, CSS,
// JS, imagens). Exemplo: um pedido para /login.html devolve o
// arquivo public/login.html, sem precisar criar uma rota para cada página.
app.use(express.static('public'));

// ============================================================
// ROTAS DA API
// ============================================================

// Rota de teste: confirma se o servidor consegue falar com o banco.
// "async" permite usar "await" para esperar a resposta do MySQL
// sem travar o servidor.
app.get('/teste-db', async (req, res) => {
  try {
    // Conta quantos registros existem na tabela usuario.
    // O resultado vem como [linhas, colunas]; pegamos só as linhas.
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM usuario');

    // Responde em JSON dizendo que a conexão funcionou e o total encontrado.
    res.json({ conectado: true, total_usuarios: rows[0].total });
  } catch (erro) {
    // Se algo falhar (banco desligado, senha errada no .env etc.),
    // responde com status 500 (erro interno do servidor).
    // Observação: mostrar erro.message é aceitável só nesta rota de
    // teste; em rotas reais isso pode expor detalhes do banco.
    res.status(500).json({ conectado: false, erro: erro.message });
  }
});

// ============================================================
// TRATAMENTO DE ROTA INEXISTENTE (404)
// IMPORTANTE: estes dois blocos precisam ficar DEPOIS de todas as
// outras rotas e do express.static. O Express testa as rotas na
// ordem em que foram escritas; se o pedido chegou até aqui, é
// porque nenhuma rota anterior atendeu, ou seja, o endereço não existe.
// Toda rota nova deve ser escrita ACIMA deste bloco.
// ============================================================

// 404 da API: quem chama /api/... é o JavaScript (fetch), que espera
// JSON. Por isso respondemos em JSON, e não com a página HTML.
app.use('/api', (req, res) => {
  res.status(404).json({ erro: 'Rota da API não encontrada.' });
});

// 404 das páginas: qualquer outro endereço inexistente recebe o 404.html.
// res.status(404) é essencial: sem ele, o navegador receberia o código
// 200 ("deu tudo certo") mesmo mostrando uma página de erro.
// path.join monta o caminho completo do arquivo; __dirname é a pasta
// onde este server.js está.
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

// Liga o servidor na porta definida e mostra o endereço no terminal.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
