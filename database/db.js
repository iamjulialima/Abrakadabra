const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./abrakadabra.db');

// Criação das tabelas
db.run(`CREATE TABLE IF NOT EXISTS servo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  estado TEXT NOT NULL,
  horario DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
)`);

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL
)`);

module.exports = db;
