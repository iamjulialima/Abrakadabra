#include <Servo.h>

Servo servo_pin_3;
const int BT = 11;       // Pino do botão
bool estado = false;     // Estado do servo (0° ou 90°)
bool ultimoEstado = HIGH;
unsigned long debounceDelay = 50;
unsigned long ultimaLeitura = 0;
int anguloAtual = 0;

void setup() {
  Serial.begin(9600);
  pinMode(BT, INPUT_PULLUP);
  servo_pin_3.attach(3);
  servo_pin_3.write(anguloAtual);
}

void loop() {
  // Leitura do botão físico
  bool leituraAtual = digitalRead(BT);

  if (leituraAtual == LOW && ultimoEstado == HIGH && (millis() - ultimaLeitura) > debounceDelay) {
    estado = !estado;
    ultimaLeitura = millis();
    Serial.println(estado ? "1" : "0"); // agora como string
  }

  ultimoEstado = leituraAtual;

  // Controle por serial
  if (Serial.available() > 0) {
    char comando = Serial.read();
    if (comando == '1') estado = true;
    else if (comando == '0') estado = false;

    // Feedback imediato
    Serial.println(estado ? "1" : "0");
  }

  // Movimento suave
  int alvo = estado ? 90 : 0;
  if (anguloAtual < alvo) anguloAtual++;
  else if (anguloAtual > alvo) anguloAtual--;

  servo_pin_3.write(anguloAtual);
  delay(30);
}