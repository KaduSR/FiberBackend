/**
 * BACKEND SERVER CODE (Node.js/Express)
 * This file implements the critical proxy logic required by the prompt.
 * To run: node server.js
 * Requires: npm install express axios jsonwebtoken cheerio google-genai helmet cors express-rate-limit dotenv
 */


// UNCOMMENT THE FOLLOWING LINES TO RUN IN A REAL NODE ENVIRONMENT
/*
import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- SECURITY CONFIGURATION ---
app.set('trust proxy', 1); // Trust Render proxy
app.use(helmet());

// CORS Configuration: More permissive for testing phase
app.use(cors({
  origin: '*', // Allow all origins for testing purposes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200 // Increased limit for testing
});
app.use('/api/', apiLimiter);

// --- CONSTANTS & SECRETS ---
const IXC_URL = process.env.IXC_URL || 'https://ixc.example.com/webservice/v1';
const IXC_TOKEN = process.env.IXC_TOKEN; // Basic Auth Base64
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';
const GEMINI_API_KEY = process.env.API_KEY; // Provided by Render env

// --- MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION (PROXY PATTERN - CPF BASED) ---
app.post('/api/auth/login', async (req, res) => {
  // Legacy endpoint - keeping for compatibility
  const { username, password } = req.body;
  const cleanCpf = username.replace(/\D/g, '');

  // Mock mode if no IXC_TOKEN
  if (!process.env.IXC_TOKEN) {
      const mockUser = {
          id: 999,
          name: 'Cliente Demo (Mock)',
          email: 'demo@fiber.net',
          planName: 'Plano 600MB Mock'
      };
      const token = jwt.sign(mockUser, JWT_SECRET);
      return res.json({ token, user: mockUser });
  }
  // ... (Rest of real logic would go here)
  res.status(500).json({ error: "Configuração de servidor incompleta" });
});

// NEW ENDPOINT: Login via CPF Only (WiFeed Style)
app.post('/api/auth/login-cpf', async (req, res) => {
    const { cpf } = req.body;
    
    // Sanitize
    const cleanCpf = cpf ? cpf.replace(/\D/g, '') : '';

    if (!cleanCpf || cleanCpf.length !== 11) {
        return res.status(400).json({ error: 'CPF inválido.' });
    }

    try {
        // MOCK MODE: If no backend credentials, authorize any valid CPF
        if (!process.env.IXC_TOKEN) {
            const mockUser = {
                id: parseInt(cleanCpf.substring(0, 4)) || 1,
                name: 'Cliente FiberNet',
                email: `cliente${cleanCpf.substring(0,3)}@email.com`,
                planName: 'Fiber Ultra 800MB'
            };
            const token = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: mockUser });
        }

        // REAL MODE: Search IXC
        const ixcRes = await axios.get(`${IXC_URL}/cliente`, {
            params: { qtype: 'cpf_cnpj', query: cleanCpf, oper: '=' },
            headers: { 'Authorization': `Basic ${IXC_TOKEN}`, 'Content-Type': 'application/json' }
        });

        const records = ixcRes.data.registros;
        if (!records || records.length === 0) {
            return res.status(401).json({ error: 'CPF não encontrado na base de dados.' });
        }

        const client = records[0];
        
        // Fetch Contract for Plan Name
        let planName = 'Plano Básico';
        try {
             const contractRes = await axios.get(`${IXC_URL}/cliente_contrato`, {
                params: { qtype: 'id_cliente', query: client.id },
                headers: { 'Authorization': `Basic ${IXC_TOKEN}` }
            });
            const activeContract = contractRes.data.registros.find(c => c.status === 'A');
            if (activeContract) planName = activeContract.contrato;
        } catch (e) { console.log("Contract fetch error", e.message); }

        const userPayload = {
            id: client.id,
            name: client.raz_social,
            email: client.email,
            planName: planName
        };

        const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: userPayload });

    } catch (error) {
        console.error("Login CPF Error", error.message);
        res.status(500).json({ error: 'Erro interno ao validar CPF.' });
    }
});


// --- DATA ROUTES ---
app.get('/api/invoices', authenticateToken, async (req, res) => {
  if (!process.env.IXC_TOKEN) {
      // MOCK DATA
      return res.json([
          { id: 1, amount: 99.90, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'open' },
          { id: 2, amount: 99.90, dueDate: new Date(Date.now() - 86400000 * 25).toISOString(), status: 'paid' },
          { id: 3, amount: 99.90, dueDate: new Date(Date.now() - 86400000 * 55).toISOString(), status: 'paid' }
      ]);
  }

  try {
    const response = await axios.get(`${IXC_URL}/fn_areceber`, {
      params: { qtype: 'id_cliente', query: req.user.id },
      headers: { 'Authorization': `Basic ${IXC_TOKEN}` }
    });
    const invoices = response.data.registros.map(inv => ({
      id: inv.id,
      amount: parseFloat(inv.valor),
      dueDate: inv.data_vencimento,
      status: inv.status === 'A' ? 'open' : 'paid'
    }));
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// --- BOT & AI LOGIC ---
app.post('/api/bot', authenticateToken, async (req, res) => {
  const { message } = req.body;
  let externalContext = "";

  try {
    // 1. Check for External Service Keywords
    const services = [
      { key: 'netflix', url: 'https://downdetector.com.br/status/netflix/' },
      { key: 'discord', url: 'https://downdetector.com.br/status/discord/' },
      { key: 'whatsapp', url: 'https://downdetector.com.br/status/whatsapp/' }
    ];

    const detectedService = services.find(s => message.toLowerCase().includes(s.key));

    // 2. Scrape DownDetector if needed
    if (detectedService) {
      try {
        const ddResponse = await axios.get(detectedService.url);
        const $ = cheerio.load(ddResponse.data);
        const indicators = $('.indicator-text').text() || "Unknown status";
        externalContext = `Contexto Externo (DownDetector): O status atual do ${detectedService.key} é: "${indicators.trim()}". Se houver problemas indicados aqui, informe o cliente que a falha não é do provedor.`;
      } catch (e) {
        console.error("Scraping failed", e.message);
      }
    }

    const ontSignal = -19.5; // Good signal
    const signalContext = `Sinal da Fibra do Cliente: ${ontSignal}dBm (Excelente). O limite é -25dBm.`;

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const systemPrompt = `
      Você é o FiberBot, um assistente técnico avançado da FiberNet.
      ${signalContext}
      ${externalContext}
      
      Regras:
      - Se o sinal estiver bom e o DownDetector apontar falhas no serviço específico (Netflix, etc), ISENTE o provedor e explique que é uma falha externa.
      - Seja técnico mas acessível.
    `;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\nUsuario: " + message }] }]
    });
    
    const reply = result.response.text();
    res.json({ reply });

  } catch (error) {
    console.error("Bot Error", error);
    res.status(500).json({ reply: "Estou com dificuldades técnicas no momento. Tente novamente." });
  }
});

// --- FALLBACK ROUTES FOR TESTING ---
app.get('/api/speedtest', (req, res) => {
    // Simulated speedtest result
    setTimeout(() => {
        res.json({
            download: (Math.random() * 100 + 400).toFixed(0),
            upload: (Math.random() * 50 + 200).toFixed(0),
            ping: Math.floor(Math.random() * 15) + 4,
            jitter: Math.floor(Math.random() * 3)
        });
    }, 1500);
});

app.get('/api/ont', authenticateToken, (req, res) => {
    res.json({
        status: 'Online',
        signal: '-19.5'
    });
});

app.get('/api/contracts', authenticateToken, (req, res) => {
    res.json([{
        id: 101,
        plan: 'Plano Ultra Fiber 600MB',
        status: 'Ativo',
        address: 'Rua das Flores, 123'
    }]);
});

app.get('/api/news', (req, res) => {
    res.json([
        {
            title: "Manutenção Programada",
            description: "Melhorias na rede fibra ótica neste domingo.",
            url: "https://google.com",
            image: "https://img.freepik.com/free-photo/server-room-datacenter_1150-16368.jpg",
            publishedAt: new Date().toISOString(),
            source: { name: "FiberNet Status", url: "#" }
        },
        {
            title: "Novo App FiberNet",
            description: "Agora você pode gerenciar suas faturas e planos diretamente pelo celular.",
            url: "https://google.com",
            image: "https://img.freepik.com/free-vector/gradient-ui-ux-background_23-2149052117.jpg",
            publishedAt: new Date().toISOString(),
            source: { name: "Novidades", url: "#" }
        }
    ]);
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
*/
module.exports = {}; // Export empty object for file validity in non-node environment