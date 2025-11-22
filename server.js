// app.js (Arquivo Corrigido)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser"); // Certifique-se de que o body-parser é usado

// --- Serviços ---
const GenieACSService = require("./services/genieacs");
// ... (outros serviços) ...

// --- Rotas ---
const speedtestRoute = require("./routes/speedtest");
const instabilidadeRoutes = require("./routes/instabilidade");
const ontRoutes = require("./routes/ont"); // Esta rota precisa ser implementada se usada
const authRoutes = require("./routes/auth");
const financeiroRoutes = require("./routes/financeiro");
const dashboardRoutes = require("./routes/dashboard");
const chatbotRoutes = require("./routes/chatbot"); // Nova Rota

const { startScheduler } = require("./cron/statusScheduler");
const authenticate = require("./middleware/authenticate");

const app = express();
const PORT = process.env.PORT || 3000;

// --- Inicialização do GenieACS Service ---
// Use o mock Service que você tem, injetando as variáveis de ambiente
const genieacs = new GenieACSService(
  process.env.GENIEACS_URL,
  process.env.GENIEACS_USER,
  process.env.GENIEACS_PASSWORD
);

app.set("genieacs", genieacs); // Injeta a instância do GenieACS no app
app.set("trust proxy", 1);

// --- Middlewares ---
app.use(cors({ origin: "*" }));
app.use(bodyParser.json()); // Necessário para processar o JSON do chatbot e login
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do Rate Limit (Opcional, mas recomendado)
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutos
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // Limite por IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// --- Rotas de API (V1) ---
app.get("/health", (req, res) =>
  res.json({ status: "online", uptime: process.uptime() })
);

// Rotas públicas (Auth)
app.use("/api/v1/auth", authRoutes);

// Rotas protegidas (Requer JWT)
app.use("/api/v1/status", authenticate, instabilidadeRoutes);
app.use("/api/v1/ont", authenticate, ontRoutes);
app.use("/api/v1/speedtest", authenticate, speedtestRoute);
app.use("/api/v1/faturas", authenticate, financeiroRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/chatbot", authenticate, chatbotRoutes); // Nova Rota do Chatbot

// Handler de Rota Não Encontrada
app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

app.listen(PORT, () => {
  console.log(`🚀 Backend FiberNet rodando na porta ${PORT}`);
  startScheduler();
});
