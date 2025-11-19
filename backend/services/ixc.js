/*
 * backend/services/ixc.js
 * Serviço responsável por todas as interações com a API do IXCSoft.
 */
const axios = require("axios");

class IXCService {
  constructor() {
    this.apiUrl =
      process.env.IXC_API_URL || "https://centralfiber.online/webservice/v1";
    this.adminToken = process.env.IXC_ADMIN_TOKEN;

    // Criação da instância Axios com autenticação básica
    // Usa Buffer nativo para garantir compatibilidade no Node.js
    const tokenBase64 = this.adminToken
      ? Buffer.from(this.adminToken).toString("base64")
      : "";

    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${tokenBase64}`,
      },
      timeout: 15000, // 15 segundos de timeout
    });
  }

  /**
   * Método Genérico para consultas "Listar" no IXC
   * Adiciona automaticamente o header obrigatório 'ixcsoft: listar'
   */
  async list(endpoint, data) {
    try {
      const response = await this.api.post(endpoint, data, {
        headers: { ixcsoft: "listar" },
      });
      return response.data;
    } catch (error) {
      console.error(`[IXC Service] Erro ao listar ${endpoint}:`, error.message);
      // Retorna estrutura vazia para não quebrar a aplicação
      return { total: 0, registros: [] };
    }
  }

  /**
   * Método Genérico para ações (Criar/Editar/GetBoleto)
   */
  async post(endpoint, data) {
    try {
      const response = await this.api.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(
        `[IXC Service] Erro ao postar em ${endpoint}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Busca um cliente pelo Login (Email) ou CPF
   */
  async findClienteByLogin(login) {
    // Remove caracteres não numéricos para testar se é CPF
    const apenasNumeros = login.replace(/\D/g, "");
    const isCpf = /^\d{11}$|^\d{14}$/.test(apenasNumeros);

    // Lógica inteligente: Tenta buscar limpo, se falhar tenta formatado (para CPF)
    let campoBusca = isCpf ? "cliente.cnpj_cpf" : "cliente.hotsite_email";
    let valorBusca = isCpf ? apenasNumeros : login;

    const payload = {
      qtype: campoBusca,
      query: valorBusca,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente.id",
      sortorder: "desc",
    };

    let resultado = await this.list("/cliente", payload);

    // Se for CPF e não achou, tenta formatar (123.456.789-00)
    if (isCpf && resultado.total === 0) {
      const cpfFormatado = apenasNumeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
      );
      payload.query = cpfFormatado;
      resultado = await this.list("/cliente", payload);
    }

    return resultado.total > 0 ? resultado.registros[0] : null;
  }

  /**
   * Busca o contrato principal ativo de um cliente
   */
  async findContratoByClienteId(clienteId) {
    const payload = {
      qtype: "cliente_contrato.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "1",
      // Prioriza contratos ativos e data de ativação mais recente
      sortname: "cliente_contrato.data_ativacao",
      sortorder: "desc",
    };

    const resultado = await this.list("/cliente_contrato", payload);
    return resultado.total > 0 ? resultado.registros[0] : null;
  }

  /**
   * Busca faturas em aberto ou pagas
   */
  async getFaturas(clienteId) {
    const payload = {
      qtype: "fn_areceber.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "20",
      sortname: "fn_areceber.data_vencimento",
      sortorder: "desc",
    };

    const resultado = await this.list("/fn_areceber", payload);
    return resultado.registros || [];
  }

  /**
   * Busca o PDF (Base64) de um boleto
   */
  async getBoleto(boletoId) {
    const payload = {
      boletos: boletoId,
      atualiza_boleto: "S",
      tipo_boleto: "arquivo",
      base64: "S",
    };
    return this.post("/get_boleto", payload);
  }

  /**
   * Busca o login PPPoE (radusuarios) pelo ID do cliente
   * Necessário para a integração com GenieACS
   */
  async getPppoeLogin(clienteId) {
    const payload = {
      qtype: "radusuarios.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "1",
    };

    const resultado = await this.list("/radusuarios", payload);
    return resultado.total > 0 ? resultado.registros[0].login : null;
  }
}

module.exports = new IXCService();
