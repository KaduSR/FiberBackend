const express = require("express");
const router = express.Router();
const ixcService = require("../services/ixc");

// Middleware de autenticação (pode usar o mesmo JWT se tiver, ou API Key simples)
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }
  next();
};

router.use(validateApiKey);

// Buscar faturas do cliente
router.get("/faturas/:cpf", async (req, res) => {
  try {
    const { cpf } = req.params;

    // 1. Achar o cliente pelo CPF
    const cliente = await ixcService.findClienteByLogin(cpf);
    if (!cliente) {
      return res.status(404).json({ error: "Cliente não encontrado" });
    }

    // 2. Buscar faturas
    const faturas = await ixcService.getFaturas(cliente.id);
    res.json(faturas);
  } catch (error) {
    console.error("Erro ao buscar faturas:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Pegar PDF do boleto
router.get("/boleto/:id", async (req, res) => {
  try {
    const boleto = await ixcService.getBoleto(req.params.id);
    res.json(boleto);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar boleto" });
  }
});

module.exports = router;
