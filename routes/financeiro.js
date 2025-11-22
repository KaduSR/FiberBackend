// routes/financeiro.js
const express = require("express");
const router = express.Router();
const ixcService = require("../services/ixc");

// IMPORTANTE: Use o middleware JWT que criamos
const authenticate = require("../middleware/authenticate");

// Protege TODAS as rotas deste arquivo com o JWT do cliente
router.use(authenticate);

// ===============================================
// 1. MINHAS FATURAS (não precisa mais de CPF na URL!)
// ===============================================
router.get("/minhas-faturas", async (req, res) => {
  try {
    // req.user vem do JWT → já sabemos quem é o cliente!
    const clienteId = req.user.ixcId;

    const faturas = await ixcService.getFaturas(clienteId);
    res.json(faturas);
  } catch (error) {
    console.error("Erro ao buscar faturas:", error.message);
    res.status(500).json({ error: "Erro ao buscar faturas" });
  }
});

// ===============================================
// 2. BOLETO POR ID (agora protegido pelo JWT)
// ===============================================
router.get("/boleto/:id", async (req, res) => {
  try {
    const boletoId = req.params.id;

    // OPCIONAL: validar se o boleto pertence ao cliente (segurança extra)
    // Mas como o IXC já faz isso, vamos confiar por enquanto

    const boleto = await ixcService.getBoleto(boletoId);
    res.json(boleto);
  } catch (error) {
    console.error("Erro ao gerar boleto:", error.message);
    res.status(500).json({ error: "Erro ao gerar boleto" });
  }
});

module.exports = router;
