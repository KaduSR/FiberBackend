require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

// --- 1. IMPORTAÇÃO DAS ROTAS ---
const instabilidadeRoutes = require("./routes/instabilidade");
const botRoutes = require("./routes/bot");
const speedtestRoutes = require("./routes/speedtest");
const ontRoutes = require("./routes/ont");

// --- 2. INICIALIZAÇÃO DO APP (CRÍTICO: Deve vir antes de qualquer app.use) ---
const app = express();
const PORT = process.env.PORT || 3000;

// --- 3. MIDDLEWARES ---
app.set("trust proxy", 1); // Necessário para o Render/Rate Limit funcionar
app.use(cors({ origin: "*" }));
app.use(express.json());

// Rate Limit (Proteção)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Muitas requisições." },
});
app.use("/api/", limiter);

// --- 4. DEFINIÇÃO DAS ROTAS ---
// Health Check (Para o Render saber que o app está vivo)
app.get("/health", (req, res) => res.json({ status: "online" }));

// Rotas da Aplicação
app.use("/api/status", instabilidadeRoutes); // Monitoramento
app.use("/api/bot", botRoutes); // Chatbot IA
app.use("/api/speedtest", speedtestRoutes); // Speedtest
app.use("/api/ont", ontRoutes); // ONT / IXC

// Rota 404 (Sempre a última)
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

// --- 5. INICIALIZAÇÃO DO SERVIDOR ---
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
