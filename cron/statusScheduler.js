/*
 * cron/statusScheduler.js
 * Automação para checagem e atualização do cache de instabilidade.
 */
const cron = require("node-cron");
const downdetectorService = require("../services/DowndetectorService");
const aiStatusService = require("../services/AIStatusService");
// Importa a lista de serviços do arquivo de rota de instabilidade
const { SERVICES_TO_CHECK } = require("../routes/instabilidade");

// Função que executa a lógica de checagem e fallback (forçando o refresh)
const automatedCheck = async () => {
  console.log(
    `[CRON] Iniciando verificação automática de status (${new Date().toISOString()})...`
  );

  // Mapeia todos os serviços para forçar a busca na fonte
  const checks = SERVICES_TO_CHECK.map(async (id) => {
    // 1. Força busca no Downdetector (usando fetchFromSource para ignorar o cache de leitura)
    let result = await downdetectorService.fetchFromSource(id);

    // 2. Se o Downdetector foi bloqueado (status unknown), usa a IA como fallback
    if (result.status === "unknown" && process.env.GEMINI_API_KEY) {
      // Chamamos a IA (askAI) para forçar o refresh do cache da IA também
      const aiResult = await aiStatusService.askAI(id, `status_${id}`);

      if (aiResult.status !== "error") {
        result = {
          ...result,
          hasIssues: aiResult.hasIssues,
          message: aiResult.message,
          source: "AI Backup (Cache Atualizado)",
          // Se a IA responder algo, marcamos como sucesso (a IA fez a checagem)
          status: aiResult.status === "unknown" ? "unknown" : "success",
        };
      }
    }
    return result;
  });

  await Promise.all(checks);
  console.log("[CRON] Verificação de status concluída. Cache atualizado.");
};

const startScheduler = () => {
  // Roda a cada 15 minutos (* * /15 * * *)
  cron.schedule("0 */15 * * * *", automatedCheck);

  // Executa a checagem inicial imediatamente para popular o cache
  automatedCheck();

  console.log(
    "[CRON] Agendador de status de serviços iniciado (a cada 15 minutos)."
  );
};

module.exports = { startScheduler };
