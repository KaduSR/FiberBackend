const axios = require("axios");
const { Buffer } = require("node:buffer");
const md5 = require("md5");

class IXCService {
  constructor() {
    this.apiUrl =
      process.env.IXC_API_URL || "https://SEU_DOMINIO/webservice/v1";
    this.adminToken = process.env.IXC_TOKEN; // Usando IXC_TOKEN conforme .env.example

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
        "radusuarios.id, radusuarios.login, radusuarios.tipo_conexao, radusuarios.ativo, radusuarios.online, radusuarios.contrato_plano_venda_",
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
      // CAMPOS ESSENCIAIS PARA BOLETO/PIX (baseado em fn_areceber.php)
      campos:
        "fn_areceber.id," +
        "fn_areceber.valor," +
        "fn_areceber.status," +
        "fn_areceber.data_vencimento," +
        "fn_areceber.linha_digitavel," + // Código de Barras / Linha Digitável
        "fn_areceber.gateway_link," + // Link do Boleto/QR Code (Se disponível)
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

  // =========================================================
  // 🔑 FUNÇÃO PRINCIPAL DE LOGIN (Autenticação e Permissão)
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
