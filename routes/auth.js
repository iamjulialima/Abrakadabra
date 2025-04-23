const express = require('express');
const router = express.Router();
const { cadastrarUsuario } = require('../controllers/authController');
const db = require('../database/db'); 

router.post('/register', cadastrarUsuario);

module.exports = router;

// LOGIN
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
  
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha são obrigatórios.' });
    }
  
    db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
      if (err) {
        return res.status(500).json({ mensagem: 'Erro ao buscar usuário.' });
      }
  
      // Se não encontrar usuário ou senha estiver incorreta
      if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({ mensagem: 'Email ou senha incorretos.' });
      }
  
      // Login bem-sucedido
      res.status(200).json({ mensagem: 'Login realizado com sucesso.' });
    });
  });
  
  