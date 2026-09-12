const crypto = require('crypto');

function obterChaveOTP() {
  const chave = process.env.CHAVE_OTP;
  if (!chave) {
    console.warn("AVISO CRÍTICO: CHAVE_OTP não definida no ambiente. Usando chave insegura de fallback para desenvolvimento.");
    return "CHAVE_INSEGURA_DE_DESENVOLVIMENTO_TROQUE_NO_PRODUCAO";
  }
  return chave;
}

function gerarCodigo() {
  const num = crypto.randomInt(0, 1000000);
  return num.toString().padStart(6, '0');
}

function gerarHmac(codigo) {
  const chave = obterChaveOTP();
  return crypto.createHmac('sha256', chave).update(codigo).digest('hex');
}

function validarHmac(codigo, hmacEsperado) {
  if (!codigo || !hmacEsperado) return false;
  
  const hmacGerado = gerarHmac(codigo);
  
  // Para evitar erro no timingSafeEqual quando os tamanhos são diferentes
  if (hmacGerado.length !== hmacEsperado.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(Buffer.from(hmacGerado), Buffer.from(hmacEsperado));
}

module.exports = {
  gerarCodigo,
  gerarHmac,
  validarHmac
};
