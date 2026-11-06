// Cria o banco "kfka" com o schema.sql e o seed.sql do grupo.
//   npm run db:criar  -> apaga e recria o banco (útil para "zerar" a demonstração)
// O servidor também chama prepararBanco() ao iniciar: se o banco ainda não existir
// (primeira vez na nuvem), ele é criado sozinho, sem precisar rodar nada à mão.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { configurarSSL } = require('../src/config/database');

const PASTA_SQL = path.join(__dirname, '..', 'database');

function conectarSemBanco() {
  return mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: configurarSSL(),
    multipleStatements: true,
    charset: 'utf8mb4',
  });
}

async function executarScripts(conn) {
  for (const arquivo of ['schema.sql', 'seed.sql']) {
    console.log(`Executando ${arquivo}...`);
    await conn.query(fs.readFileSync(path.join(PASTA_SQL, arquivo), 'utf8'));
  }
}

async function bancoExiste(conn) {
  const [rows] = await conn.query(
    `SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'kfka' AND table_name = 'acompanhamento'`
  );
  return rows.length > 0;
}

// Chamado pelo server.js: cria o banco só se ainda não existir
async function prepararBanco() {
  const conn = await conectarSemBanco();
  try {
    if (await bancoExiste(conn)) return false;
    console.log('Banco kfka não encontrado: criando com schema.sql e seed.sql...');
    await executarScripts(conn);
    return true;
  } finally {
    await conn.end();
  }
}

// Chamado por "npm run db:criar": recria do zero
async function recriarBanco() {
  const conn = await conectarSemBanco();
  try {
    console.log('Apagando banco antigo (se existir)...');
    await conn.query('DROP DATABASE IF EXISTS kfka');
    await executarScripts(conn);
    const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM kfka.acompanhamento');
    console.log(`Pronto! Banco kfka criado com ${total} acompanhamentos de exemplo.`);
  } finally {
    await conn.end();
  }
}

module.exports = { prepararBanco };

if (require.main === module) {
  recriarBanco().catch((erro) => {
    console.error('Erro ao criar o banco:', erro.message);
    process.exit(1);
  });
}
