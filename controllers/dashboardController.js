const axios = require("axios");
const { Buffer } = require("node:buffer");
const md5 = require("md5");

class IXCService {
  constructor() {
    this.apiUrl =
      process.env.IXC_API_URL || "https://centralfiber.online/webservice/v1"; // DOMÍNIO CORRIGIDO
    this.adminToken = process.env.IXC_TOKEN;

    // Geração do token Basic (Base64) a partir do token administrativo
    const tokenBase64 = this.adminToken
      ? Buffer.from(this.adminToken).toString("base64")
      : "";

    this.api = axios.create({
      baseURL: this.apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${tokenBase64}`,
      },
      timeout: 15000,
    });
  }

  // Método base para listar (GET/READ - Usa POST com header 'listar')
  async list(endpoint, data) {
    try {
      const response = await this.api.post(endpoint, data, {
        headers: { ixcsoft: "listar" },
      });
      return response.data;
    } catch (error) {
      console.error(`[IXC] Erro ao listar ${endpoint}:`, error.message);
      return { total: 0, registros: [] };
    }
  }

  // Método base para postar ações (necessário para get_boleto e criação de ticket)
  async post(endpoint, data, actionHeader = "") {
    try {
      const headers = {};
      if (actionHeader) {
        headers.ixcsoft = actionHeader;
      }
      const response = await this.api.post(endpoint, data, { headers });
      return response.data;
    } catch (error) {
      console.error(
        `[IXC] Erro ao postar ${endpoint} (${actionHeader || "post"}):`,
        error.message
      );
      throw error;
    }
  }

  // =========================================================
  // 🔑 BUSCAS PARA AUTENTICAÇÃO E DADOS BASE
  // =========================================================

  /**
   * 1. Busca Cliente por Login (Email, CPF ou CNPJ) para autenticação.
   */
  async findClienteByLogin(login) {
    const apenasNumeros = login.replace(/\D/g, "");
    const isCpf = /^\d{11}$|^\d{14}$/.test(apenasNumeros);

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
      campos:
        "cliente.id, cliente.nome, cliente.hotsite_email, cliente.cnpj_cpf, cliente.hotsite_senha, cliente.status_hot",
    };

    let resultado = await this.list("/cliente", payload);

    // Tentativa de busca de documento formatado (melhora compatibilidade)
    if (isCpf && resultado.total === 0) {
      const docFormatado =
        apenasNumeros.length === 11
          ? apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
          : apenasNumeros.replace(
              /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
              "$1.$2.$3/$4-$5"
            );

      payload.query = docFormatado;
      resultado = await this.list("/cliente", payload);
    }

    return resultado.total > 0 ? resultado.registros[0] : null;
  }

  /**
   * 7. Busca Detalhes Cadastrais do Cliente (Baseado em cliente.php)
   * @param {number} clienteId
   */
  async getCliente(clienteId) {
    const payload = {
      qtype: "cliente.id",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "1",
      campos:
        "cliente.nome, cliente.cnpj_cpf, cliente.email, cliente.celular, cliente.whatsapp, cliente.cep, cliente.endereco, cliente.numero, cliente.complemento, cliente.bairro, cliente.cidade, cliente.uf, cliente.status_hot",
    };

    const resultado = await this.list("/cliente", payload);
    return resultado.registros[0] || null;
  }

  /**
   * 2. Busca Contrato (o mais recente/ativo). Baseado em cliente_contrato.php.
   */
  async getContrato(clienteId) {
    const payload = {
      qtype: "cliente_contrato.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "cliente_contrato.data_ativacao",
      sortorder: "desc",
      campos:
        "cliente_contrato.id, cliente_contrato.contrato, cliente_contrato.data_ativacao, cliente_contrato.data_cancelamento, cliente_contrato.status, vd_contrato_plano_c.plano_venda, cliente_contrato.data_venc_contrato, cliente_contrato.descricao_aux_plano_venda",
    };

    const resultado = await this.list("/cliente_contrato", payload);
    return resultado.registros[0] || null;
  }

  /**
   * 3. Busca Dados de Conexão (radusuarios). Baseado em radusuarios.php.
   */
  async getDadosConexao(clienteId) {
    const payload = {
      qtype: "radusuarios.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "1",
      sortname: "radusuarios.id",
      sortorder: "desc",
      campos:
        "radusuarios.id, radusuarios.login, radusuarios.tipo_conexao, radusuarios.ativo, radusuarios.online, radusuarios.contrato_plano_venda_, radusuarios.id_contrato, radusuarios.ip",
    };

    const resultado = await this.list("/radusuarios", payload);
    return resultado.registros[0] || null;
  }

  /**
   * 4. Busca Faturas (fn_areceber). Inclui Pix, QR Code e Código de Barras.
   */
  async getFaturas(clienteId) {
    const payload = {
      qtype: "fn_areceber.id_cliente",
      query: clienteId,
      oper: "=",
      page: "1",
      rp: "10",
      sortname: "fn_areceber.data_vencimento",
      sortorder: "desc",
      campos:
        "fn_areceber.id," +
        "fn_areceber.valor," +
        "fn_areceber.status," +
        "fn_areceber.data_vencimento," +
        "fn_areceber.linha_digitavel," +
        "fn_areceber.gateway_link," +
        "fn_areceber.pix_txid," +
        "fn_areceber.documento",
    };

    const resultado = await this.list("/fn_areceber", payload);
    return resultado.registros || [];
  }

  /**
   * 5. Busca Boleto PDF (Base64)
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
   * 6. Cria um novo Ticket de Suporte (Baseado em su_ticket.php)
   */
  async createTicket(idCliente, titulo, mensagem, idAssunto) {
    const now = new Date()
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("/"); // Formato DD/MM/AAAA

    const payload = {
      id_cliente: idCliente,
      id_assunto: idAssunto || 0,
      titulo: titulo,
      menssagem: mensagem,

      tipo: "C",
      origem_cadastro: "P",
      id_ticket_origem: "I",
      status: "T",
      prioridade: "M",
      data_criacao: now,
      ultima_atualizacao: now,
      su_status: "N",
      mensagens_nao_lida_sup: "1",
    };

    const resultado = await this.post("su_ticket", payload, "inserir");

    return resultado;
  }

  // =========================================================
  // 🔑 AUTENTICAÇÃO PRINCIPAL
  // =========================================================
  async authenticate(login, senha) {
    const cliente = await this.findClienteByLogin(login);

    if (!cliente) {
      return null;
    }

    const senhaHashed = md5(senha);

    if (cliente.hotsite_senha === senhaHashed) {
      return {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.hotsite_email,
        cpf_cnpj: cliente.cnpj_cpf,
        status_hotsite: cliente.status_hot,
      };
    }

    return null;
  }
}

module.exports = new IXCService();
