/*
 * FiberNet Backend API - Versão Final (Integração Completa)
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const base64 = require("react-native-base64");
const axios = require("axios");
const cheerio = require("cheerio");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Importação segura do Speedtest
let speedTest;
try {
  speedTest = require("speedtest-net");
} catch (e) {
  console.warn("Speedtest module not found");
}

const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIGURAÇÃO ---
app.set("trust proxy", 1);
app.use(cors({ origin: "*" })); // Permite conexão do App
app.use(bodyParser.json());

// Variáveis de Ambiente
const IXC_API_URL =
  process.env.IXC_API_URL || "https://centralfiber.online/webservice/v1";
const IXC_ADMIN_TOKEN = process.env.IXC_ADMIN_TOKEN;
const JWT_SECRET = process.env.JWT_SECRET;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// --- AUXILIARES IXC ---
const ixcApi = axios.create({
  baseURL: IXC_API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${base64.encode(IXC_ADMIN_TOKEN || "")}`,
  },
  timeout: 15000,
});

const ixcPostList = async (endpoint, data) => {
  const config = { headers: { ixcsoft: "listar" } };
  const response = await ixcApi.post(endpoint, data, config);
  return response.data;
};

// --- ROTAS ---

// 1. LOGIN CPF (Estilo WiFeed - Só CPF)
app.post("/api/auth/login-cpf", async (req, res) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ error: "CPF obrigatório" });

  try {
    const cpfLimpo = cpf.replace(/\D/g, ""); // Remove pontos e traços
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
      return res.status(401).json({ error: "CPF não encontrado." });
    }

    const cliente = clienteRes.registros[0];

    // Busca contrato para pegar status
    const contratoBody = {
      qtype: "cliente_contrato.id_cliente",
      query: cliente.id,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente_contrato.data_ativacao",
      sortorder: "desc",
    };
    const contratoRes = await ixcPostList("/cliente_contrato", contratoBody);
    const contrato = contratoRes.registros[0] || {
      id: "0",
      status: "Sem Contrato",
    };

    // Gera Token
    const userData = {
      id_cliente: cliente.id,
      id_contrato: contrato.id,
      nome_cliente: cliente.razao,
      email: cliente.hotsite_email,
      status_contrato: contrato.status,
    };
    const token = jwt.sign(userData, JWT_SECRET || "secret", {
      expiresIn: "30d",
    });

    res.json({ token, user: userData });
  } catch (error) {
    console.error("Erro Login CPF:", error.message);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// 2. SPEEDTEST (Backend executa o teste)
app.get("/api/speedtest", async (req, res) => {
  if (!speedTest)
    return res.status(503).json({ error: "Módulo Speedtest ausente" });
  try {
    const result = await speedTest({ acceptLicense: true, acceptGdpr: true });
    res.json({
      download: (result.download.bandwidth / 125000).toFixed(2),
      upload: (result.upload.bandwidth / 125000).toFixed(2),
      ping: result.ping.latency.toFixed(0),
      server: result.server.name,
    });
  } catch (error) {
    res.status(500).json({ error: "Falha no teste de velocidade" });
  }
});

// 3. NOTÍCIAS (GNews - Tecnologia e Fibra)
app.get("/api/news", async (req, res) => {
  if (!NEWS_API_KEY) return res.json([]); // Retorna vazio se não tiver chave
  try {
    const query = "tecnologia OR 'fibra óptica' OR streaming OR games";
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(
      query
    )}&lang=pt&apikey=${NEWS_API_KEY}`;
    const { data } = await axios.get(url);
    res.json(data.articles || []);
  } catch (error) {
    res.json([]);
  }
});

// 4. CHATBOT (Gemini + DownDetector)
app.post("/api/bot", async (req, res) => {
  try {
    const { message, history } = req.body;
    let contextInfo = "";

    // Verifica DownDetector se mencionar serviços
    const servicos = ["discord", "netflix", "youtube", "instagram", "facebook"];
    const alvo = servicos.find((s) => message.toLowerCase().includes(s));

    if (alvo) {
      try {
        const { data } = await axios.get(
          `https://downdetector.com.br/fora-do-ar/${alvo}/`
        );
        const $ = cheerio.load(data);
        const status = $(".entry-title").first().text().trim();
        if (status.toLowerCase().includes("problema")) {
          contextInfo = `ALERTA: O DownDetector reporta problemas no ${alvo}. Avise o cliente que não é a internet dele.`;
        } else {
          contextInfo = `STATUS: O DownDetector diz que o ${alvo} está normal.`;
        }
      } catch (e) {
        contextInfo = `Não foi possível verificar o ${alvo}.`;
      }
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o suporte da FiberNet. Contexto técnico: ${contextInfo}. Responda de forma breve e útil.`;

    const result = await model.generateContent([prompt, message]);
    res.json({ reply: result.response.text() });
  } catch (error) {
    res.json({
      reply: "Desculpe, estou com dificuldade de conexão no momento.",
    });
  }
});

// 5. DADOS PROTEGIDOS (Faturas/Contratos)
// Middleware JWT
const checkAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token necessário" });
  try {
    req.user = jwt.verify(token, JWT_SECRET || "secret");
    next();
  } catch (e) {
    res.status(401).json({ error: "Token inválido" });
  }
};

app.get("/api/invoices", checkAuth, async (req, res) => {
  try {
    const body = {
      qtype: "fn_areceber.id_cliente",
      query: req.user.id_cliente,
      oper: "=",
      page: "1",
      rp: "20",
      sortname: "fn_areceber.data_vencimento",
      sortorder: "desc",
    };
    const data = await ixcPostList("/fn_areceber", body);
    res.json(data.registros || []);
  } catch (e) {
    res.status(500).json({ error: "Erro ao buscar faturas" });
  }
});

// Health check final
app.get("/", (req, res) => res.send("FiberNet API Online 🚀"));

app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
