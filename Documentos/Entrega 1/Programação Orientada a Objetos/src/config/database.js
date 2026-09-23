require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool de conexões: reaproveita conexões em vez de abrir uma por requisição
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  dateStrings: ['DATE'], // datas sem hora (ex.: nascimento) chegam como 'AAAA-MM-DD'
});

module.exports = pool;
