require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/database');
const SistemaKFKA = require('./core/SistemaKFKA');
const Autenticador = require('./core/Autenticador');
const criarRotas = require('./routes');
const tratarErros = require('./middlewares/tratarErros');
const { prepararBanco } = require('../scripts/criarBanco');

const app = express();
app.use(cors()); // permite que o front-end (outro endereço) chame a API
app.use(express.json());

// Uma única instância da classe principal atende toda a aplicação
const autenticador = new Autenticador(process.env.JWT_SECRET);
const sistema = new SistemaKFKA(pool, autenticador);

app.get('/', (req, res) => {
  res.json({
    sistema: 'KFKA – Plataforma de Acompanhamento Escolar',
    equipe: 'Nova Stark',
    saude: '/api/saude',
    login: 'POST /api/login  {"email":"...","senha":"..."}',
  });
});

app.get('/api/saude', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', banco: 'ok' });
  } catch {
    res.status(500).json({ api: 'ok', banco: 'indisponível' });
  }
});

app.use('/api', criarRotas(sistema, autenticador));
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use(tratarErros);

const PORT = process.env.PORT || 3000;

async function iniciar() {
  try {
    const criado = await prepararBanco();
    console.log(criado ? 'Banco criado com os dados de exemplo.' : 'Banco kfka encontrado.');
  } catch (erro) {
    console.error('Não foi possível preparar o banco:', erro.message);
  }
  app.listen(PORT, () => console.log(`KFKA rodando na porta ${PORT}`));
}

iniciar();
