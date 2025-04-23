const db = require('../database/db');

function cadastrarUsuario(req, res) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ mensagem: 'Preencha todos os campos' });
  }

  const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.run(query, [nome, email, senha], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ mensagem: 'Email já cadastrado' });
      }
      return res.status(500).json({ mensagem: 'Erro ao cadastrar usuário' });
    }

    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso', id: this.lastID });
  });
}

module.exports = { cadastrarUsuario };
