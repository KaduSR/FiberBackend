// routes/chatbot.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const chatbotController = require("../controllers/chatbotController");

// A rota do chatbot deve ser protegida pelo token JWT do cliente
router.post("/processar", authenticate, chatbotController.processarIntencao);

module.exports = router;
