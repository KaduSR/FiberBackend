// routes/financeiro.js
const express = require("express");
const router = express.Router();
const ixcService = require("../services/ixc");
const authenticate = require("../middleware/authenticate");
const financeiroController = require("../controllers/financeiroController"); // Importando o Controller

// Protege TODAS as rotas deste arquivo com o JWT do cliente
router.use(authenticate);

// ===============================================
// 1. MINHAS FATURAS (Listagem Completa)
// ===============================================
router.get("/minhas-faturas", financeiroController.getMinhasFaturas);

// ===============================================
// 2. BOLETO POR ID (Gera PDF Base64)
// ===============================================
router.get("/boleto/:id", financeiroController.getBoleto);

module.exports = router;
