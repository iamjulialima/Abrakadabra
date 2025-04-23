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
  botao.textContent = ligado ? 'Fechar portão' : 'Abrir portão';
  botao.disabled = false;
}

setInterval(atualizarEstado, 500);
atualizarEstado();

async function atualizarStatus() {
  try {
    const res = await fetch('/status-completo');
    const data = await res.json();

    const statusTexto = document.querySelector('.status p:nth-of-type(1)');
    const horarioTexto = document.querySelector('.status p:nth-of-type(2)');
    const btn = document.getElementById('servoBtn');

    statusTexto.innerHTML = `<strong>Seu portão está:</strong> ${data.estado}`;
    horarioTexto.innerHTML = `<strong>Dia e horário que foi ${data.estado === 'Aberto' ? 'aberto' : 'fechado'}:</strong> ${data.horario}`;
    btn.innerText = data.estado === 'Aberto' ? 'Fechar portão' : 'Abrir portão';
  } catch (e) {
    console.error('Erro ao buscar status:', e);
  }
}

setInterval(atualizarStatus, 3000);
atualizarStatus();

