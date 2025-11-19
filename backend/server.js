/*
 * ==========================================
 * FIBERNET BACKEND API (Versão Final - Correção CPF)
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
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Serviços Internos
const ontRoutes = require("./routes/ont");
const GenieACSService = require("./services/genieacs");

// Importação Segura do Speedtest
let speedTest;
try {
  speedTest = require("speedtest-net");
} catch (e) {
  console.warn("⚠️ AVISO: Módulo 'speedtest-net' não carregado.");
}

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Segurança
app.set("trust proxy", 1);
app.use(cors({ origin: "*" }));
// app.use(helmet());

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Muitas requisições. Tente novamente mais tarde." },
});
app.use("/api/", limiter);

// 3. Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- VARIÁVEIS ---
const IXC_API_URL =
  process.env.IXC_API_URL || "https://centralfiber.online/webservice/v1";
const IXC_ADMIN_TOKEN = process.env.IXC_ADMIN_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET || "secret_key_default";
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GENIEACS_URL = process.env.GENIEACS_URL || "http://localhost:7557";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

console.log("--- SERVIDOR INICIADO ---");

// --- CLIENTES API ---

// 1. IXC
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

const ixcPostList = async (endpoint, data) => {
  const config = { headers: { ixcsoft: "listar" } };
  try {
    const response = await ixcApi.post(endpoint, data, config);
    return response.data;
  } catch (error) {
    console.error(`Erro IXC (${endpoint}):`, error.message);
    return { total: 0, registros: [] };
  }
};

// 2. GenieACS
const genieacs = new GenieACSService(
  GENIEACS_URL,
  process.env.GENIEACS_USER,
  process.env.GENIEACS_PASSWORD
);
app.set("genieacs", genieacs);

// 3. Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");

// --- FUNÇÃO AUXILIAR IMPORTANTE ---
function formatarDocumento(valor) {
  const apenasNumeros = valor.replace(/\D/g, "");

  // Se for CPF (11 dígitos) -> 000.000.000-00
  if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  // Se for CNPJ (14 dígitos) -> 00.000.000/0000-00 (caso tenha cliente PJ)
  if (apenasNumeros.length === 14) {
    return apenasNumeros.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  }

  return valor; // Retorna original se não for nem CPF nem CNPJ
}

// ==========================================
// ROTAS
// ==========================================

app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- LOGIN COM SENHA ---
app.post("/api/auth/login", async (req, res, next) => {
  const { login, senha } = req.body;
  if (!login || !senha)
    return res.status(400).json({ error: "Preencha login e senha." });

  try {
    // Verifica se é email ou CPF
    const isEmail = login.includes("@");

    // Se for CPF, formata. Se for email, usa como está.
    const loginFormatado = isEmail ? login : formatarDocumento(login);

    const campoBusca = isEmail ? "cliente.hotsite_email" : "cliente.cnpj_cpf";

    console.log(`[Login] Buscando por: ${loginFormatado} (${campoBusca})`);

    const searchBody = {
      qtype: campoBusca,
      query: loginFormatado, // AGORA VAI FORMATADO (123.456.789-00)
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

    if (String(cliente.senha) !== String(senha)) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Gera Token
    const contratoData = await buscarContratoPrincipal(cliente.id);
    const responseData = gerarRespostaAuth(cliente, contratoData);
    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

// --- LOGIN CPF (ACESSO RÁPIDO) ---
app.post("/api/auth/login-cpf", async (req, res, next) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ error: "CPF obrigatório." });

  try {
    // Força a formatação correta (Pontos e Traço)
    const cpfFormatado = formatarDocumento(cpf);

    console.log(`[Login CPF] Buscando por: ${cpfFormatado}`);

    const searchBody = {
      qtype: "cliente.cnpj_cpf",
      query: cpfFormatado, // ENVIA 123.456.789-00
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

    if (cliente.ativo === "N") {
      return res.status(403).json({ error: "Cadastro inativo." });
    }

    const contratoData = await buscarContratoPrincipal(cliente.id);
    const responseData = gerarRespostaAuth(cliente, contratoData);
    res.json(responseData);
  } catch (error) {
    next(error);
  }
});

// --- OUTRAS ROTAS (GNews, Speedtest, Bot...) ---

app.get("/api/news", async (req, res) => {
  if (!NEWS_API_KEY) return res.json([]);
  try {
    const query = "tecnologia OR 'fibra óptica' OR streaming";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=pt&apikey=${NEWS_API_KEY}`;
    const { data } = await axios.get(url);
    res.json(data.articles || []);
  } catch (e) {
    res.json([]);
  }
});

app.get("/api/speedtest", async (req, res, next) => {
  if (!speedTest) return res.status(503).json({ error: "Indisponível." });
  try {
    const result = await speedTest({ acceptLicense: true, acceptGdpr: true });
    res.json({
      download: (result.download.bandwidth / 125000).toFixed(2),
      upload: (result.upload.bandwidth / 125000).toFixed(2),
      ping: result.ping.latency.toFixed(0),
      server: result.server.name,
      url: result.result.url,
    });
  } catch (e) {
    res.status(500).json({ error: "Falha no teste." });
  }
});

app.post("/api/bot", async (req, res) => {
  try {
    const { message, history } = req.body;
    let info = "";
    const apps = [
      "discord",
      "netflix",
      "youtube",
      "instagram",
      "facebook",
      "whatsapp",
    ];
    const app = apps.find((s) => message.toLowerCase().includes(s));

    if (app) {
      try {
        const { data } = await axios.get(
          `https://downdetector.com.br/fora-do-ar/${app}/`
        );
        const $ = cheerio.load(data);
        const status = $(".entry-title").first().text().trim();
        info = status.toLowerCase().includes("problema")
          ? `ALERTA: O DownDetector reporta problemas no ${app}.`
          : `STATUS: O DownDetector diz que o ${app} está normal.`;
      } catch (e) {}
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history:
        history?.map((h) => ({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.content }],
        })) || [],
    });
    const result = await chat.sendMessage(
      `Você é o suporte da FiberNet. ${info} ${message}`
    );
    res.json({ reply: result.response.text() });
  } catch (e) {
    res.json({ reply: "Erro no bot." });
  }
});

// Middleware de Autenticação
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido" });
  }
};

app.use(checkAuth);

// Dados Protegidos
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

app.use("/api/ont", ontRoutes);

// Auxiliares
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
    return { id: "0", status: "Erro" };
  }
}

function gerarRespostaAuth(cliente, contrato) {
  const userData = {
    id_cliente: cliente.id,
    id_contrato: contrato.id,
    nome_cliente: cliente.razao,
    email: cliente.hotsite_email,
    status_contrato: contrato.status,
  };
  const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" });
  return { token, user: userData };
}

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
