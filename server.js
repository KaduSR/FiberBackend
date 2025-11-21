require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const GenieACSService = require("./services/genieacs");
const speedtestRoute = require("./routes/speedtest");
const instabilidadeRoutes = require("./routes/instabilidade");
const ontRoutes = require("./routes/ont");

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

// Aumentei o limite global de JSON caso precise enviar dados grandes fora do speedtest
app.use(express.json({ limit: "1024mb" }));
app.use(express.static("public"));

// Configuração Específica para Speedtest (1024MB)
app.use(
  "/api/speedtest",
  // Permite raw binary (blobs) até 700mb
  express.raw({ limit: "700mb", type: "application/octet-stream" }),
  // Permite forms urlencoded até 1GB
  express.urlencoded({ extended: true, limit: "700mb" })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});

app.use("/api/", limiter);

app.get("/health", (req, res) =>
  res.json({ status: "online", uptime: process.uptime() })
);

app.use("/api/status", instabilidadeRoutes);
app.use("/api/ont", ontRoutes);
app.use("/api/speedtest", speedtestRoute);

app.use((req, res) => res.status(404).json({ error: "Rota não encontrada." }));

app.listen(PORT, () => {
  console.log(`🚀 Backend FiberNet rodando na porta ${PORT}`);
});
