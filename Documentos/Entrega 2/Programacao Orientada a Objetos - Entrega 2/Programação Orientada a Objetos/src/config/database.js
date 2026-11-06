require('dotenv').config();
const mysql = require('mysql2/promise');

// Na nuvem (Aiven) o banco exige conexão segura (SSL).
// Localmente, deixe DB_SSL=false.
function configurarSSL() {
  if (process.env.DB_SSL !== 'true') return undefined;
  if (process.env.DB_CA_CERT) {
    // certificado da Aiven colado na variável de ambiente (opcional, mais seguro)
    return { ca: process.env.DB_CA_CERT.replace(/\\n/g, '\n') };
  }
  return { rejectUnauthorized: false };
}

// Pool de conexões: reaproveita conexões em vez de abrir uma por requisição
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'kfka',
  ssl: configurarSSL(),
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  timezone: '-03:00', // horários lidos/gravados no fuso de Brasília
  dateStrings: ['DATE'], // datas sem hora (ex.: nascimento) chegam como 'AAAA-MM-DD'
});

// O MySQL na nuvem roda em UTC: cada conexão passa a usar o horário de Brasília
// (assim NOW() e CURRENT_TIMESTAMP batem com o horário da escola)
pool.pool.on('connection', (conexao) => conexao.query("SET time_zone = '-03:00'"));

module.exports = pool;
module.exports.configurarSSL = configurarSSL;
