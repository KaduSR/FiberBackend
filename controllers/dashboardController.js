// controllers/dashboardController.js
const ixcService = require("../services/ixc");

exports.getDashboard = async (req, res) => {
  const clienteId = req.user.ixcId; // vem do JWT

  try {
    const [faturasRes, contratosRes, radusuariosRes] = await Promise.all([
      // 1. Faturas em aberto
      ixcService.list("/fn_areceber", {
        qtype: "fn_areceber.id_cliente",
        query: clienteId,
        oper: "=",
        status: "A", // só em aberto
        page: "1",
        rp: "10",
        sortname: "fn_areceber.data_vencimento",
        sortorder: "asc",
      }),

      // 2. Contratos (todos + contagem de ativos)
      ixcService.list("/cliente_contrato", {
        qtype: "cliente_contrato.id_cliente",
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "20",
        sortname: "cliente_contrato.data_ativacao",
        sortorder: "desc",
      }),

      // 3. Radusuarios (para consumo e plano)
      ixcService.list("/radusuarios", {
        qtype: "radusuarios.id_cliente",
        query: clienteId,
        oper: "=",
        page: "1",
        rp: "5",
      }),
    ]);

    // === Processamento dos dados ===
    const faturasAbertas = faturasRes.registros || [];
    const contratos = contratosRes.registros || [];
    const radusuario = (radusuariosRes.registros || [])[0]; // geralmente só 1 ativo

    const contratosAtivos = contratos.filter(
      (c) => c.status === "A" || c.status === "Ativo"
    ).length;

    const consumoSemanalGB = radusuario
      ? (parseFloat(radusuario.franquia_consumo || 0) / 1024).toFixed(2)
      : "0.00";

    res.json({
      faturas: {
        count: faturasAbertas.length,
        mensagem:
          faturasAbertas.length === 0
            ? "Olá, suas FATURAS estão todas em dia! 😊"
            : `${faturasAbertas.length} fatura(s) em aberto`,
        lista: faturasAbertas,
      },
      termos: {
        count: 0, // depois você adiciona filtro real de termos pendentes
        mensagem: "Olá, você não tem pendências em seus TERMOS 😊",
      },
      atendimentos: {
        count: 0,
        mensagem: "Desculpe, você não tem novas MENSAGENS 😊",
      },
      consumo: {
        plano:
          radusuario?.contrato_plano_venda_ || "FTTH FIBER-1024MB-PLUS_NO_CABO",
        endereco: radusuario?.endereco || "ESTR. SÍTIO DA PEDREIRA, 100",
        nome: radusuario?.cliente_titular || "carlos.casa",
        downloadGB: consumoSemanalGB,
        uploadGB: (
          parseFloat(radusuario?.franquia_consumo_up || 0) / 1024
        ).toFixed(2),
        grafico: [], // depois você preenche com histórico real
      },
      contratos: {
        total: contratos.length,
        ativos: contratosAtivos,
        mensagem:
          contratosAtivos === contratos.length
            ? "Olá, você não tem pendências em seus CONTRATOS 😊"
            : `${contratos.length - contratosAtivos} contrato(s) inativo(s)`,
      },
    });
  } catch (error) {
    console.error("Erro no dashboard:", error.message);
    res.status(500).json({ error: "Erro ao carregar dashboard" });
  }
};
