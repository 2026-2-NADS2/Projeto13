require('dotenv').config();
const express = require('express');
const pool = require('./config/database');
const SistemaKFKA = require('./core/SistemaKFKA');
const criarRotas = require('./routes');
const tratarErros = require('./middlewares/tratarErros');

const app = express();
app.use(express.json());

// Uma única instância da classe principal atende toda a aplicação
const sistema = new SistemaKFKA(pool);

app.get('/api/saude', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', banco: 'ok' });
  } catch {
    res.status(500).json({ api: 'ok', banco: 'indisponível' });
  }
});

app.use('/api', criarRotas(sistema));
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use(tratarErros);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KFKA rodando em http://localhost:${PORT}`));
