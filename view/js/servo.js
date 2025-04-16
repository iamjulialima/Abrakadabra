let ligado = false;

async function atualizarEstado() {
  try {
    const res = await fetch('/status');
    const data = await res.json();
    ligado = parseInt(data.ligado);
    atualizarBotao();
  } catch (e) {
    console.error('Erro ao obter status:', e);
  }
}

async function alternar() {
  const novoEstado = ligado ? '0' : '1';
  try {
    const res = await fetch('/servo/' + novoEstado);
    const data = await res.json();
    ligado = parseInt(data.status) === 1;
    atualizarBotao();
  } catch (e) {
    console.error('Erro ao alternar estado:', e);
  }
}

function atualizarBotao() {
  const botao = document.getElementById('servoBtn');
  botao.textContent = ligado ? 'Desligar Servo' : 'Ligar Servo';
  botao.disabled = false;
}

setInterval(atualizarEstado, 500);
atualizarEstado();
