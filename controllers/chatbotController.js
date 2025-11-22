// AplicativoFIber/controllers/chatbotController.js
const ixcService = require("../services/ixc");

/**
 * @typedef {object} ChatbotRequest
 * @property {string} ixcId ID do cliente IXC (do JWT).
 * @property {string} message Mensagem do usuário (Intenção).
 */

/**
 * @desc Processa a intenção do usuário e executa ações de diagnóstico ou suporte.
 * @route POST /api/v1/chatbot/processar
 */
exports.processarIntencao = async (req, res) => {
  const ixcId = req.user.ixcId;
  const { message } = req.body;

  // Para fins de demonstração, assumimos que a 'Intenção' foi extraída.
  // Em uma aplicação real, a IA do Gemini ou um NLU faria essa classificação.
  const intencao = classificarIntencao(message);

  if (!ixcId) {
    return res
      .status(401)
      .json({ reply: "Sua sessão não está ativa. Por favor, refaça o login." });
  }

  try {
    const dadosConexao = await ixcService.getDadosConexao(ixcId);

    if (!dadosConexao || !dadosConexao.id_contrato) {
      return res.json({
        reply:
          "Não consegui localizar um contrato ativo para sua conta. Por favor, entre em contato com o suporte humano.",
      });
    }

    const loginConexao = dadosConexao.login;
    // Pega a instância do GenieACS Service do Express (assumindo que está no server.js)
    const genieacsService = req.app.get("genieacs");

    let chatbotResponse = {
      reply: "",
      acao: null,
      dados: null,
    };

    switch (intencao) {
      case "DIAGNOSTICO_INTERNET":
        if (!genieacsService) {
          chatbotResponse.reply =
            "Serviço de diagnóstico indisponível. Por favor, crie um chamado.";
          break;
        }

        // Simular Diagnóstico
        const diagnostico = await genieacsService.runDiagnostic(loginConexao);

        if (diagnostico.causa_problema.includes("Sinal Óptico")) {
          chatbotResponse.reply = `Detectamos um problema no sinal da sua fibra. Recomendamos a abertura de um chamado técnico, mas antes, tente reiniciar o seu equipamento.`;
          chatbotResponse.acao = "SUGERIR_REBOOT";
        } else if (
          diagnostico.conexao_status === "Offline (Falha de Autenticação)"
        ) {
          chatbotResponse.reply =
            "Sua conexão não está autenticando. Isso geralmente é um bloqueio. Por favor, verifique suas faturas pendentes.";
          chatbotResponse.acao = "VERIFICAR_FINANCEIRO";
        } else if (diagnostico.reboot_necessario) {
          chatbotResponse.reply = `Parece que um ciclo de energia resolveria. Gostaria de tentar reiniciar sua ONT agora?`;
          chatbotResponse.acao = "SUGERIR_REBOOT";
        } else {
          chatbotResponse.reply =
            "Seu status de conexão está normal, mas se o problema persistir, abra um chamado.";
          chatbotResponse.acao = "SUGERIR_CHAMADO";
        }
        chatbotResponse.dados = diagnostico;
        break;

      case "ABRIR_CHAMADO":
        // 1. Cria o ticket no IXC (Baseado em su_ticket.php)
        const ticketResult = await ixcService.createTicket(
          ixcId,
          "Problema Reportado pelo Chatbot",
          `O cliente solicitou a abertura de chamado após diagnóstico inicial. Descrição do problema: ${message}`,
          100 // Exemplo: ID para Assunto 'Internet Instável'
        );

        if (ticketResult.id) {
          chatbotResponse.reply = `Chamado de suporte aberto com sucesso! Nosso protocolo é **${ticketResult.id}**. Um técnico entrará em contato em breve.`;
          chatbotResponse.acao = "CONFIRMACAO_CHAMADO";
        } else {
          chatbotResponse.reply =
            "Não foi possível abrir o chamado. Tente novamente ou use nosso WhatsApp.";
          chatbotResponse.acao = "ERRO_IXC";
        }
        break;

      case "REINICIAR_ONT":
        // Tenta fazer o reboot via GenieACS
        const rebootResult = await genieacsService.rebootONT(
          dadosConexao.login
        );
        chatbotResponse.reply =
          rebootResult.message + " Aguarde 5 minutos e teste novamente.";
        chatbotResponse.acao = "REBOOT_EXECUTADO";
        break;

      case "SAUDACAO":
      default:
        chatbotResponse.reply = `Olá ${
          req.user.nome.split(" ")[0]
        }! Eu sou o assistente virtual da FiberNet. Como posso ajudar hoje? (Ex: "Minha internet está lenta" ou "Quero pagar a fatura")`;
        chatbotResponse.acao = "DEFAULT";
        break;
    }

    res.json(chatbotResponse);
  } catch (error) {
    console.error("[Chatbot Controller] Erro fatal no processamento:", error);
    res
      .status(500)
      .json({ reply: "Desculpe, ocorreu um erro interno na nossa IA." });
  }
};

// Função Simples para classificar a intenção (Em produção, usaria Gemini/Dialogflow)
function classificarIntencao(message) {
  const msg = message.toLowerCase();

  if (
    msg.includes("internet") ||
    msg.includes("lenta") ||
    msg.includes("caiu")
  ) {
    return "DIAGNOSTICO_INTERNET";
  }
  if (
    msg.includes("abrir chamado") ||
    msg.includes("chamar tecnico") ||
    msg.includes("abrir ticket")
  ) {
    return "ABRIR_CHAMADO";
  }
  if (msg.includes("reiniciar") || msg.includes("reboot")) {
    return "REINICIAR_ONT";
  }
  return "SAUDACAO";
}
