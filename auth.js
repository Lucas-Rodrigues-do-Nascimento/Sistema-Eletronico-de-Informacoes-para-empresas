const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('./db');

const app = express();
app.use(express.json());

const SECRET_KEY = 'sua_chave_secreta';

// Endpoint de login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  if (!usuario || !senha) {
    return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
  }

  const query = 'SELECT * FROM usuarios WHERE usuario = ?';
  connection.query(query, [usuario], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao conectar ao banco de dados.' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    }

    const user = results[0];
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ message: 'Usuário ou senha incorretos.' });
    }

    const token = jwt.sign({ id: user.id, usuario: user.usuario }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  });
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

