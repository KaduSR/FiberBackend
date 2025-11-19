/*
 * ==========================================
 * FIBERNET BACKEND API (Versão Final Completa)
 * Integrações: IXC, GenieACS, Speedtest, GNews, Gemini, DownDetector
 * ==========================================
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const cheerio = require("cheerio"); // Para o DownDetector e Monitor
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Serviços Internos
const ontRoutes = require("./routes/ont");
const GenieACSService = require("./services/genieacs");

// Importação Segura do Speedtest (Evita crash no deploy se falhar)
let speedTest;
try {
  speedTest = require("speedtest-net");
} catch (e) {
  console.warn(
    "⚠️ AVISO: Módulo 'speedtest-net' não carregado. A rota /api/speedtest falhará."
  );
}

// --- CONFIGURAÇÃO DO APP ---
const app = express();
const PORT = process.env.PORT || 3000;

// 1. Segurança e Proxy (Crítico para Render)
app.set("trust proxy", 1);
app.use(cors({ origin: "*" })); // Libera acesso para o App Expo
// app.use(helmet()); // (Opcional: Descomente em produção se não bloquear scripts)

// 2. Rate Limiting (Proteção contra abuso)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Limite relaxado para testes
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});
app.use("/api/", limiter);

// 3. Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- VARIÁVEIS DE AMBIENTE ---
const IXC_API_URL =
  process.env.IXC_API_URL || "https://centralfiber.online/webservice/v1";
const IXC_ADMIN_TOKEN = process.env.IXC_ADMIN_TOKEN; // Formato ID:TOKEN
const JWT_SECRET = process.env.JWT_SECRET || "fibernet_secret_key_change_me";
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GENIEACS_URL = process.env.GENIEACS_URL || "http://localhost:7557";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Log de Inicialização
console.log("--- INICIANDO SERVIDOR FIBERNET ---");
console.log(`IXC Endpoint: ${IXC_API_URL}`);
console.log(`IXC Token: ${IXC_ADMIN_TOKEN ? "Configurado ✅" : "AUSENTE ❌"}`);

// --- CLIENTES API ---

// 1. Cliente IXC (Axios)
// Usamos Buffer do Node.js para Base64 (Correção do erro 'base64 is not a function')
const tokenBase64 = IXC_ADMIN_TOKEN
  ? Buffer.from(IXC_ADMIN_TOKEN).toString("base64")
  : "";

const ixcApi = axios.create({
  baseURL: IXC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${tokenBase64}`,
  },
  timeout: 15000,
});

// Helper para chamadas de pesquisa no IXC (com header 'listar')
const ixcPostList = async (endpoint, data) => {
  const config = { headers: { ixcsoft: "listar" } };
  try {
    const response = await ixcApi.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(`Erro IXC (${endpoint}):`, error.message);
    // Retorna vazio para não quebrar a lógica
    return { total: 0, registros: [] };
  }
};

// 2. Cliente GenieACS
const genieacs = new GenieACSService(
  GENIEACS_URL,
  process.env.GENIEACS_USER,
  process.env.GENIEACS_PASSWORD
);
app.set("genieacs", genieacs);

// 3. Cliente Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// --- MIDDLEWARES ---

// Verifica Token JWT
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Acesso negado. Token necessário." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Adiciona dados do user ao request
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido ou expirado." });
  }
};

// ==========================================
// ROTAS DA API
// ==========================================

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// --- 1. AUTENTICAÇÃO ---

// Login Padrão (E-mail/CPF + Senha)
app.post("/api/auth/login", async (req, res, next) => {
  const { login, senha } = req.body;
  if (!login || !senha)
    return res.status(400).json({ error: "Preencha login e senha." });

  try {
    // Limpa CPF se for numérico
    const isCpf = /^\d+$/.test(login.replace(/\D/g, ""));
    const loginLimpo = isCpf ? login.replace(/\D/g, "") : login;

    const campoBusca = login.includes("@")
      ? "cliente.hotsite_email"
      : "cliente.cnpj_cpf";
    const searchBody = {
      qtype: campoBusca,
      query: loginLimpo,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente.id",
      sortorder: "desc",
    };

    const clienteRes = await ixcPostList("/cliente", searchBody);

    if (clienteRes.total === 0 || !clienteRes.registros[0]) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const cliente = clienteRes.registros[0];

    // Valida Senha (Comparação local)
    if (String(cliente.senha) !== String(senha)) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Busca Contrato e Gera Token
    const contratoData = await buscarContratoPrincipal(cliente.id);
    const responseData = gerarRespostaAuth(cliente, contratoData);
    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

// Login CPF (Estilo WiFeed - Acesso Rápido)
app.post("/api/auth/login-cpf", async (req, res, next) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ error: "CPF obrigatório." });

  try {
    const cpfLimpo = cpf.replace(/\D/g, ""); // Remove pontuação

    // 1. Busca apenas por CPF
    const searchBody = {
      qtype: "cliente.cnpj_cpf",
      query: cpfLimpo,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente.id",
      sortorder: "desc",
    };

    const clienteRes = await ixcPostList("/cliente", searchBody);

    if (clienteRes.total === 0 || !clienteRes.registros[0]) {
      return res.status(404).json({ error: "CPF não encontrado na base." });
    }

    const cliente = clienteRes.registros[0];

    // 2. Validação opcional de status (Bloquear inativos)
    if (cliente.ativo === "N") {
      return res
        .status(403)
        .json({ error: "Cadastro inativo. Contate o suporte." });
    }

    // 3. Busca Contrato e Gera Token
    const contratoData = await buscarContratoPrincipal(cliente.id);
    const responseData = gerarRespostaAuth(cliente, contratoData);
    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

// --- 2. FUNCIONALIDADES PÚBLICAS/MISTAS ---

// Monitoramento de Instabilidades (Nova Rota para a aba Status)
// Cache simples para não bloquear o DownDetector com muitas requisições
let statusCache = { lastUpdate: 0, data: [] };

app.get("/api/instabilities", async (req, res) => {
  const now = Date.now();
  // Cache de 10 minutos
  if (now - statusCache.lastUpdate < 10 * 60 * 1000) {
    return res.json(statusCache.data);
  }

  const servicesToCheck = [
    "discord",
    "netflix",
    "youtube",
    "instagram",
    "facebook",
    "whatsapp",
    "tiktok",
    "roblox",
  ];
  const unstableServices = [];

  // Verifica em paralelo
  await Promise.all(
    servicesToCheck.map(async (service) => {
      try {
        const { data } = await axios.get(
          `https://downdetector.com.br/fora-do-ar/${service}/`,
          {
            headers: { "User-Agent": "Mozilla/5.0" },
            timeout: 5000,
          }
        );
        const $ = cheerio.load(data);
        const statusText = $(".entry-title").first().text().trim();

        if (
          statusText.toLowerCase().includes("problema") ||
          statusText.toLowerCase().includes("falha")
        ) {
          unstableServices.push({
            id: service,
            name: service.charAt(0).toUpperCase() + service.slice(1),
            status: statusText,
          });
        }
      } catch (e) {}
    })
  );

  statusCache = { lastUpdate: now, data: unstableServices };
  res.json(unstableServices);
});

// Notícias (GNews)
app.get("/api/news", async (req, res, next) => {
  if (!NEWS_API_KEY) return res.json([]);
  try {
    // Busca notícias específicas
    const query =
      "tecnologia OR jogos OR games OR 'fibra óptica' OR filmes OR series";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=pt&apikey=${NEWS_API_KEY}`;
    const { data } = await axios.get(url);
    res.json(data.articles || []);
  } catch (error) {
    res.json([]);
  }
});

// Speedtest (Servidor)
app.get("/api/speedtest", async (req, res, next) => {
  if (!speedTest)
    return res.status(503).json({ error: "Módulo Speedtest indisponível." });

  console.log("[Speedtest] Iniciando teste...");
  try {
    const result = await speedTest({ acceptLicense: true, acceptGdpr: true });
    res.json({
      download: (result.download.bandwidth / 125000).toFixed(2), // Mbps
      upload: (result.upload.bandwidth / 125000).toFixed(2), // Mbps
      ping: result.ping.latency.toFixed(0),
      server: result.server.name,
      url: result.result.url,
    });
  } catch (error) {
    console.error("[Speedtest] Erro:", error.message);
    res.status(500).json({ error: "Falha ao medir velocidade." });
  }
});

// Chatbot (Gemini + DownDetector)
app.post("/api/bot", async (req, res, next) => {
  try {
    const { message, history } = req.body;
    if (!GEMINI_API_KEY) throw new Error("IA não configurada.");

    // Verificação Rápida DownDetector
    let contextInfo = "";
    const servicosAlvo = [
      "discord",
      "netflix",
      "youtube",
      "instagram",
      "facebook",
      "whatsapp",
    ];
    const servicoDetectado = servicosAlvo.find((s) =>
      message.toLowerCase().includes(s)
    );

    if (servicoDetectado) {
      try {
        const { data } = await axios.get(
          `https://downdetector.com.br/fora-do-ar/${servicoDetectado}/`
        );
        const $ = cheerio.load(data);
        const statusText = $(".entry-title").first().text().trim();

        if (statusText.toLowerCase().includes("problema")) {
          contextInfo = `[ALERTA EXTERNO]: O DownDetector reporta problemas no ${servicoDetectado}. Avise que a falha não é na internet.`;
        } else {
          contextInfo = `[STATUS EXTERNO]: O DownDetector diz que o ${servicoDetectado} está normal. Sugira verificar o Wi-Fi.`;
        }
      } catch (e) {}
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemPrompt = `Você é o FiberBot, suporte da FiberNet. Contexto: ${contextInfo}. Responda de forma breve.`;

    const chat = model.startChat({
      history:
        history?.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        })) || [],
      systemInstruction: systemPrompt,
    });

    const result = await chat.sendMessage(message);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.json({ reply: "Desculpe, estou com dificuldade de conexão." });
  }
});

// --- 3. DADOS PROTEGIDOS (Requerem Token) ---

app.use(checkAuth); // Aplica proteção a tudo abaixo

// Faturas (IXC)
app.get("/api/invoices", async (req, res, next) => {
  try {
    const body = {
      qtype: "fn_areceber.id_cliente",
      query: req.user.id_cliente,
      oper: "=",
      page: "1",
      rp: "50",
      sortname: "fn_areceber.data_vencimento",
      sortorder: "desc",
    };
    const data = await ixcPostList("/fn_areceber", body);
    res.json(data.registros || []);
  } catch (e) {
    next(e);
  }
});

// Contratos (IXC)
app.get("/api/contracts", async (req, res, next) => {
  try {
    const body = {
      qtype: "cliente_contrato.id_cliente",
      query: req.user.id_cliente,
      oper: "=",
      page: "1",
      rp: "10",
      sortname: "cliente_contrato.id",
      sortorder: "desc",
    };
    const data = await ixcPostList("/cliente_contrato", body);
    res.json(data.registros || []);
  } catch (e) {
    next(e);
  }
});

// Boleto PDF (IXC)
app.get("/api/boleto/:id", async (req, res, next) => {
  try {
    const body = {
      boletos: req.params.id,
      atualiza_boleto: "S",
      tipo_boleto: "arquivo",
      base64: "S",
    };
    const { data } = await ixcApi.post("/get_boleto", body);
    res.json(data);
  } catch (e) {
    next(e);
  }
});

// Status ONT (GenieACS)
app.use("/api/ont", ontRoutes);

// --- FUNÇÕES AUXILIARES ---

async function buscarContratoPrincipal(idCliente) {
  try {
    const body = {
      qtype: "cliente_contrato.id_cliente",
      query: idCliente,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente_contrato.data_ativacao",
      sortorder: "desc",
    };
    const res = await ixcPostList("/cliente_contrato", body);
    return res.registros && res.registros[0]
      ? res.registros[0]
      : { id: "0", status: "Desconhecido" };
  } catch (e) {
    return { id: "0", status: "Erro na busca" };
  }
}

function gerarRespostaAuth(cliente, contrato) {
  const userData = {
    id_cliente: cliente.id,
    id_contrato: contrato.id,
    nome_cliente: cliente.razao,
    email: cliente.hotsite_email,
    telefone: cliente.telefone_celular,
    status_contrato: contrato.status,
  };
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });
  return { token, user: userData };
}

// --- ERROR HANDLING ---
app.use((req, res) =>
  res.status(404).json({ error: "Endpoint não encontrado" })
);
app.use((err, req, res, next) => {
  console.error("Erro Servidor:", err.message);
  const status = err.response?.status || 500;
  res.status(status).json({ error: "Erro interno no servidor." });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
