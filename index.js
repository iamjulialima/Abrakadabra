const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');
const db = require('./database/db');

const app = express();
const port = 3000;

app.use(express.json()); // Para ler JSON no body
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);


// Porta serial
const arduino = new SerialPort({
  path: '/dev/ttyUSB0', 
  baudRate: 9600,
});

const parser = arduino.pipe(new ReadlineParser({ delimiter: '\n' }));

let servoLigado = false;
let respostaPendente = null;

// Ouvindo respostas do Arduino
let ultimoComando = null;
let ultimoComandoTempo = 0;

parser.on('data', (data) => {
  const comando = data.toString().trim();
  const agora = Date.now();
  console.log('[DEBUG] Recebido do Arduino:', comando);

  if (comando === '1' || comando === '0') {
    const novoEstado = comando === '1';

    // Ignora comandos repetidos dentro de 1 segundo
    if (comando === ultimoComando && (agora - ultimoComandoTempo < 1000)) {
      console.log('[IGNORADO] Comando repetido em menos de 1 segundo.');
      return;
    }

    ultimoComando = comando;
    ultimoComandoTempo = agora;

    servoLigado = novoEstado;
    const now = new Date();
const horarioLocal = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
db.run('INSERT INTO servo (estado, horario) VALUES (?, ?)', [comando, horarioLocal]);


    console.log('[SALVO] Estado atualizado para:', comando);

    if (respostaPendente) {
      respostaPendente(comando);
      respostaPendente = null;
    }
  }
});


app.use(express.static(path.join(__dirname, 'view')));

// Enviar comando e esperar confirmação
app.get('/servo/:state', async (req, res) => {
  const state = req.params.state;

  if (state !== '1' && state !== '0') {
    return res.status(400).send('Comando inválido');
  }

  try {
    const resposta = await enviarParaArduino(state);
    res.json({ status: resposta.toString() });
  } catch (e) {
    res.status(500).send('Erro ao comunicar com Arduino');
  }
});

function enviarParaArduino(comando) {
  return new Promise((resolve, reject) => {
    respostaPendente = resolve;

    arduino.write(comando + '\n', (err) => {
      if (err) {
        respostaPendente = null;
        reject(err);
      }
    });

    setTimeout(() => {
      if (respostaPendente) {
        respostaPendente = null;
        reject('Timeout');
      }
    }, 2000);
  });
}

// Status atual
app.get('/status', (req, res) => {
  res.json({ ligado: servoLigado ? 1 : 0 });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});



app.get('/status-completo', (req, res) => {
  db.get('SELECT estado, horario FROM servo ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar status' });
    }

    if (row) {
      res.json({
        estado: row.estado === '1' ? 'Aberto' : 'Fechado',
        horario: row.horario
      });
    } else {
      res.json({
        estado: 'Desconhecido',
        horario: 'N/A'
      });
    }
  });
});


app.get('/registros', (req, res) => {
  db.all("SELECT estado, horario FROM servo ORDER BY horario DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const registrosFormatados = rows.map(r => {
      // Converte string ou número para booleano
      const estadoNumerico = Number(r.estado);
      return {
        horario: r.horario,
        estado: estadoNumerico === 1 ? 'aberto' : 'fechado'
      };
    });

    res.json(registrosFormatados);
  });
});


