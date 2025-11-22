const ixcService = require("../services/ixc");

/**
 * @desc Retorna todos os dados essenciais do cliente logado para o Dashboard.
 * Consolida dados cadastrais, contrato, conexão e faturas.
 * @route GET /api/v1/dashboard/dados
 */
exports.getDashboardData = async (req, res) => {
  // ID do cliente obtido do JWT (configurado no middleware 'authenticate.js')
  const clienteId = req.user.ixcId;

  try {
    // 1. Dispara todas as requisições essenciais em paralelo
    const [contrato, conexao, faturas] = await Promise.all([
      ixcService.getContrato(clienteId),
      ixcService.getDadosConexao(clienteId),
      ixcService.getFaturas(clienteId),
    ]);

    // 2. Busca dados cadastrais para o cabeçalho (requer mais campos que o login)
    // Opcional: buscar todos os dados cadastrais (ex: endereço)
    const clienteDetalhes = await ixcService.getCliente(clienteId);

    // 3. Tratamento e Formatação dos dados

    // Conexão
    const dadosConexao = conexao
      ? {
          login: conexao.login,
          status: conexao.online,
          plano: conexao.contrato_plano_venda_,
          tipo: conexao.tipo_conexao,
        }
      : null;

    // Faturas
    const dadosFaturas = faturas.map((fatura) => ({
      id: fatura.id,
      documento: fatura.documento,
      valor: fatura.valor,
      status: fatura.status, // A, R, C, P
      vencimento: fatura.data_vencimento,

      // Dados para Pagamento
      linha_digitavel: fatura.linha_digitavel || null, // Código de Barras
      link_boleto: fatura.gateway_link || null, // Link de visualização (se o gateway retornar)
      pix_txid: fatura.pix_txid || null, // TXID do Pix
    }));

    // 4. Consolida a resposta
    res.json({
      cliente: {
        nome: req.user.nome,
        email: req.user.email,
        cadastro: clienteDetalhes, // Detalhes de endereço, etc.
      },
      contrato: contrato || {},
      conexao: dadosConexao,
      faturas: dadosFaturas,
      // notas_fiscais: [], // Placeholder, a ser implementado
    });
  } catch (error) {
    console.error(
      `[DashboardController] Erro ao buscar dados do cliente ${clienteId}:`,
      error.message
    );
    res.status(500).json({
      error: "Erro interno ao buscar dados do cliente no IXC.",
    });
  }
};
