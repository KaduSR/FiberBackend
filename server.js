// app.js (Arquivo Corrigido)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const net = require("net");

const GenieACSService = require("./services/genieacs");
const speedtestRoute = require("./routes/speedtest");
const instabilidadeRoutes = require("./routes/instabilidade");
const ontRoutes = require("./routes/ont");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

const genieacs = new GenieACSService(
  process.env.GENIEACS_URL,
  process.env.GENIEACS_USER,
  process.env.GENIEACS_PASSWORD
);

app.set("genieacs", genieacs);
app.set("trust proxy", 1);

app.use(cors({ origin: "*" }));

// ... (Restante do código de middlewares e whoami) ...

app.get("/health", (req, res) =>
  res.json({ status: "online", uptime: process.uptime() })
);

// --- CORREÇÃO APLICADA AQUI ---
// Agora, todas as rotas são acessadas via /api/v1/
app.use("/api/v1/status", instabilidadeRoutes);
app.use("/api/v1/ont", ontRoutes);
app.use("/api/v1/speedtest", speedtestRoute);

// ROTA DE AUTENTICAÇÃO IXC
app.use("/api/v1/auth", authRoutes);

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

app.listen(PORT, () => {
  console.log(`🚀 Backend FiberNet rodando na porta ${PORT}`);
});
