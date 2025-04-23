const express = require('express');
const router = express.Router();
const { cadastrarUsuario } = require('../controllers/authController');

router.post('/register', cadastrarUsuario);

module.exports = router;
