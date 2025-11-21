// services/downdetector.js
const axios = require("axios");
const cheerio = require("cheerio");

// Configuração do cliente HTTP para parecer um navegador real
const browserClient = axios.create({
  timeout: 10000, // Aumentei para 10s
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
});

let cache = {
  lastUpdate: 0,
  data: [],
  ttl: 5 * 60 * 1000, // 5 minutos (reduzi para testar mais rápido)
};

const servicesToCheck = [
  { id: "discord", name: "Discord" },
  { id: "netflix", name: "Netflix" },
  { id: "youtube", name: "YouTube" },
  { id: "instagram", name: "Instagram" },
  { id: "facebook", name: "Facebook" },
  { id: "whatsapp-messenger", name: "WhatsApp" },
  { id: "tiktok", name: "TikTok" },
  { id: "roblox", name: "Roblox" },
  { id: "nubank", name: "Nubank" },
  { id: "banco-inter", name: "Inter" },
];

async function checkService(serviceId, serviceName) {
  const url = `https://downdetector.com.br/fora-do-ar/${serviceId}/`;

  try {
    const { data } = await browserClient.get(url);
    const $ = cheerio.load(data);

    // Tenta capturar o título de várias formas
    // O Downdetector varia entre h2, h1 ou classes específicas dependendo do layout
    let statusText =
      $(".entry-title").text().trim() ||
      $("h2.h2").first().text().trim() ||
      $("div.indicator-title").text().trim() ||
      "";

    statusText = statusText.toLowerCase();

    // Lógica de Detecção
    // 1. Se tiver "problemas" E "não" na mesma frase, provavelmente é "não há problemas"
    // 2. Se tiver "problemas" ou "falha" e NÃO tiver "não", é erro real.

    let status = "operational";
    let isFailure = false;

    // Verifica palavras-chave de erro
    if (
      statusText.includes("problema") ||
      statusText.includes("falha") ||
      statusText.includes("instabilidade")
    ) {
      // Verifica se é um falso positivo ("não indicam problemas")
      if (
        !statusText.includes("não indicam") &&
        !statusText.includes("sem problemas")
      ) {
        status = "warning";
        isFailure = true;
      }
    }

    // LOG PARA DEBUG (Importante para ver no terminal se está funcionando)
    if (isFailure) {
      console.log(
        `[ALERTA] ${serviceName}: Detectado -> "${statusText.substring(
          0,
          50
        )}..."`
      );
    }

    return {
      id: serviceId,
      name: serviceName,
      status: status,
      updatedAt: new Date().toISOString(),
      // Opcional: mandar o texto para o front saber o motivo
      reason: isFailure ? statusText : null,
    };
  } catch (e) {
    console.error(`[ERRO] Falha ao checar ${serviceName}: ${e.message}`);
    // Em caso de erro, retorna operacional para não travar o app
    return {
      id: serviceId,
      name: serviceName,
      status: "operational",
      updatedAt: new Date().toISOString(),
    };
  }
}

async function getInstabilities() {
  const now = Date.now();

  // Retorna cache se válido
  if (now - cache.lastUpdate < cache.ttl && cache.data.length > 0) {
    return cache.data;
  }

  console.log("🔄 Iniciando varredura do Downdetector...");

  // Busca dados em paralelo
  const results = await Promise.all(
    servicesToCheck.map((s) => checkService(s.id, s.name))
  );

  // Filtra APENAS quem tem problema (warning)
  const problems = results.filter((r) => r.status !== "operational");

  // Atualiza cache
  cache = { lastUpdate: now, data: problems };

  console.log(
    `✅ Varredura concluída. ${problems.length} serviços com problemas encontrados.`
  );

  return problems;
}

module.exports = { getInstabilities };
