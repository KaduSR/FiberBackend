/*
 * FiberNet Backend API - V7 (Modularizada com IXCService)
 */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

// --- SERVIÇOS ---
const ixcService = require("./services/ixc"); // <-- O NOVO SERVIÇO
const GenieACSService = require("./services/genieacs");
// ... (outros imports: cheerio, googleAI, speedtest, routes/ont)

// ... (Configurações do Express: app, cors, trust proxy, etc. MANTENHA IGUAL)

// Variáveis
const JWT_SECRET = process.env.JWT_SECRET || "secret_dev";
// ... (outras chaves)

// --- ROTAS ---

// 1. LOGIN (Agora muito mais limpo)
app.post("/api/auth/login", async (req, res, next) => {
  const { login, senha } = req.body;
  if (!login || !senha)
    return res.status(400).json({ error: "Dados incompletos." });

  try {
    // Usa o serviço para buscar o cliente
    const cliente = await ixcService.findClienteByLogin(login);

    if (!cliente) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    // Valida senha (segurança no backend)
    if (String(cliente.senha) !== String(senha)) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // Busca contrato
    const contrato = await ixcService.findContratoByClienteId(cliente.id);
    const statusContrato = contrato ? contrato.status : "Sem Contrato";
    const idContrato = contrato ? contrato.id : "0";

    // Gera Token
    const userData = {
      id_cliente: cliente.id,
      id_contrato: idContrato,
      nome_cliente: cliente.razao,
      email: cliente.hotsite_email,
      status_contrato: statusContrato,
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: userData });
  } catch (error) {
    next(error);
  }
});

// 2. LOGIN CPF (Acesso Rápido)
app.post("/api/auth/login-cpf", async (req, res, next) => {
  const { cpf } = req.body;
  if (!cpf) return res.status(400).json({ error: "CPF obrigatório." });

  try {
    const cliente = await ixcService.findClienteByLogin(cpf);

    if (!cliente) {
      return res.status(404).json({ error: "CPF não encontrado." });
    }

    // Validação opcional de status
    if (cliente.ativo === "N") {
      return res.status(403).json({ error: "Cadastro inativo." });
    }

    const contrato = await ixcService.findContratoByClienteId(cliente.id);
    const statusContrato = contrato ? contrato.status : "Sem Contrato";
    const idContrato = contrato ? contrato.id : "0";

    const userData = {
      id_cliente: cliente.id,
      id_contrato: idContrato,
      nome_cliente: cliente.razao,
      email: cliente.hotsite_email,
      status_contrato: statusContrato,
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user: userData });
  } catch (error) {
    next(error);
  }
});

// 3. DADOS PROTEGIDOS (Faturas e Contratos usando o Serviço)
// ... (middleware checkAuth continua igual)

app.get("/api/invoices", async (req, res, next) => {
  try {
    // Chama o serviço passando o ID do token
    const faturas = await ixcService.getFaturas(req.user.id_cliente);
    res.json(faturas);
  } catch (e) {
    next(e);
  }
});

app.get("/api/boleto/:id", async (req, res, next) => {
  try {
    const dadosBoleto = await ixcService.getBoleto(req.params.id);
    res.json(dadosBoleto);
  } catch (e) {
    next(e);
  }
});
