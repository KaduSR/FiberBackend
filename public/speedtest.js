const express = require("express");
const router = express.Router();
const crypto = require("crypto");

// Cache de 1MB de dados aleatórios para evitar processamento excessivo de CPU
const chunk = crypto.randomBytes(1024 * 1024);

// GET: Teste de Download (Envia dados para o cliente)
router.get("/", (req, res) => {
  // O cliente pode solicitar um tamanho específico via query string (ex: ?size=50MB)
  // Se não especificado, o padrão será o stream contínuo até o cliente fechar
  const size = req.query.size || "infinite";

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");

  // Função para enviar dados em loop
  const sendChunk = () => {
    // Se a conexão estiver aberta, continua enviando
    if (!res.write(chunk)) {
      // Se o buffer do kernel estiver cheio, espera o evento 'drain'
      res.once("drain", sendChunk);
    } else {
      // Loop imediato se o buffer estiver livre
      process.nextTick(sendChunk);
    }
  };

  sendChunk();

  // Para o envio se o cliente desconectar
  req.on("close", () => res.end());
});

// POST: Teste de Upload (Recebe dados do cliente)
router.post("/", (req, res) => {
  // O middleware no server.js já processou o body (raw ou urlencoded)
  // Aqui só precisamos confirmar o recebimento.

  const dataSize = req.body.length || 0;

  // Resposta simples e rápida para não afetar a medição de latência
  res.status(200).json({
    received: true,
    sizeBytes: dataSize,
    timestamp: Date.now(),
  });
});

module.exports = router;
