import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { buscarCodigo } from './emailReader.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Backend do Email Receiver funcionando!');
});

app.get('/codigo', async (req, res) => {
  const { email, senha } = req.query;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios.' });
  }

  const codigo = await buscarCodigo(email, senha);
  if (codigo) {
    res.json({ codigo });
  } else {
    res.status(404).json({ erro: 'Código não encontrado.' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
