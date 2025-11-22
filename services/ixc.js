// /opt/render/project/src/services/ixc.js
const axios = require("axios");

class IXCService {
  constructor() {
    // 1. Defina o cabeçalho usando o Token de Administrador
    const adminToken = process.env.IXC_ADMIN_TOKEN;
    const baseURL = process.env.IXC_API_URL;

    // Verificação de segurança (Opcional, mas Recomendada)
    if (!adminToken || !baseURL) {
      // Lança um erro claro se as variáveis estiverem faltando
      throw new Error(
        "IXC_ADMIN_TOKEN or IXC_API_URL environment variables are missing."
      );
    }

    // 2. Formate o cabeçalho para autenticação por Token
    // Formato de autenticação comum para Tokens: 'Authorization: Token <valor_do_token>'
    this.authHeader = `Token ${adminToken}`;

    this.api = axios.create({
      baseURL: baseURL,
      headers: {
        Authorization: this.authHeader, // Agora usa o Token
        "Content-Type": "application/json",
      },
    });
  }

  // ... other methods
}

module.exports = new IXCService();
