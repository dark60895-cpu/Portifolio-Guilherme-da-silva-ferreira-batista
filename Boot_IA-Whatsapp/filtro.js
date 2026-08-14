const palavrasBloqueadas = [
  // adicione aqui palavras/termos que o bot NUNCA deve responder
];

function mensagemPermitida(texto) {
  const lower = texto.toLowerCase();
  return !palavrasBloqueadas.some((p) => lower.includes(p));
}

module.exports = { mensagemPermitida };

