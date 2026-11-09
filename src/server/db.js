// ============================================================
// db.js
// Cria o "pool" de conexões com o MySQL e o exporta para as rotas.
// As credenciais NÃO ficam no código: são lidas do arquivo .env,
// que não vai para o GitHub.
// ============================================================

// Módulo nativo do Node para montar caminhos de arquivos.
const path = require('path');

// Carrega as variáveis do arquivo .env para process.env.
// O "path" aponta para o .env na MESMA pasta deste arquivo. Sem ele,
// o dotenv procuraria o .env na pasta onde o terminal está.
// "quiet: true" só esconde a mensagem de propaganda do dotenv.
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

// Versão "promise" do driver mysql2: permite usar async/await.
const mysql = require('mysql2/promise');

// Fuso horário da escola. O Brasil não tem mais horário de verão,
// então São Paulo é sempre UTC-3. Os servidores na nuvem (Render,
// banco gerenciado) costumam rodar em UTC; sem esta configuração,
// "o bimestre fecha às 23:59" viraria 20:59 no horário da escola.
const FUSO_DA_ESCOLA = '-03:00';

// Monta a configuração SSL. rejectUnauthorized: true = só conecta se
// o certificado do servidor for confirmado pelo CA (evita que alguém
// no meio do caminho finja ser o banco). Algumas telas de variáveis de
// ambiente guardam as quebras de linha como "\n"; o replace as volta
// a ser quebras de linha de verdade.
function configurarSsl() {
  const ca = process.env.DB_SSL_CA ? process.env.DB_SSL_CA.replace(/\\n/g, '\n') : undefined;
  return { minVersion: 'TLSv1.2', rejectUnauthorized: true, ca };
}

// Pool = conjunto de conexões reaproveitáveis. Em vez de abrir e
// fechar uma conexão a cada consulta, cada rota pega uma livre e
// devolve depois.
const pool = mysql.createPool({
  host: process.env.DB_HOST,         // endereço do servidor MySQL
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,         // usuário do banco
  password: process.env.DB_PASSWORD, // senha (só no .env, nunca no código)
  database: process.env.DB_NAME,     // nome do banco (kfka)
  charset: 'utf8mb4',                // garante acentos e "ç" corretos
  timezone: FUSO_DA_ESCOLA,          // como o Node lê/escreve datas do banco
  // Bancos na nuvem (como o Aiven) exigem conexão criptografada (SSL).
  // Ligue com DB_SSL=true. Se o provedor tiver certificado próprio
  // (o Aiven tem: "CA certificate"), cole o texto dele em DB_SSL_CA.
  ssl: process.env.DB_SSL === 'true' ? configurarSsl() : undefined,
});

// Toda conexão nova do pool passa a usar o fuso da escola também
// DENTRO do MySQL. Assim NOW() e os DEFAULT CURRENT_TIMESTAMP
// (criado_em, data_hora do histórico) ficam no horário de Brasília.
pool.pool.on('connection', (conexao) => {
  conexao.query(`SET time_zone = '${FUSO_DA_ESCOLA}'`);
});

// Exporta o pool para as rotas usarem com require('./db').
module.exports = pool;
