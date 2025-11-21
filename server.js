/*
 * server.js - Backend FiberNet Integrado
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// --- IMPORTAÇÃO DE SERVIÇOS ---
const GenieACSService = require("./services/genieacs");
// O IXC já exporta uma instância (new IXCService), então não precisa instanciar aqui
// const ixcService = require("./services/ixc");

// --- IMPORTAÇÃO DAS ROTAS ---
const instabilidadeRoutes = require("./routes/instabilidade"); // Adicionado o "."
const ontRoutes = require("./routes/ont");
const financeiroRoutes = require("./routes/financeiro"); // Sugestão para usar o ixc.js

// --- CONFIGURAÇÃO DO APP ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- INICIALIZAÇÃO DE SERVIÇOS ---
// Inicializa o GenieACS com as variáveis de ambiente
const genieacs = new GenieACSService(
  process.env.GENIEACS_URL,
  process.env.GENIEACS_USER,
  process.env.GENIEACS_PASSWORD
);

// Injeta o serviço no app para ser acessível nas rotas via req.app.get('genieacs')
app.set("genieacs", genieacs);

// --- MIDDLEWARES ---
app.set("trust proxy", 1);
app.use(cors({ origin: "*" })); // Em produção, restrinja as origens
app.use(express.json());

// Rate Limit (Proteção básica)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Limite de requisições
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});
app.use("/api/", limiter);

// --- ROTAS ---
app.get("/health", (req, res) =>
  res.json({ status: "online", uptime: process.uptime() })
);

// Rota: Status/DownDetector
app.use("/api/status", instabilidadeRoutes);

// Rota: ONT/GenieACS
app.use("/api/ont", ontRoutes);

// Rota 404 - Handler para rotas inexistentes
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// --- START ---
app.listen(PORT, () => {
  console.log(`🚀 Backend FiberNet rodando na porta ${PORT}`);
  console.log(`📡 Serviços Ativos: Instabilidade, ONT (GenieACS)`);
});
