/**
 * URL do seu Backend no Render.
 * Todas as requisições do app sairão daqui.
 */
export const API_BASE_URL = 'https://api.centralfiber.online';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: '/api/auth/login', // Legacy
    LOGIN_CPF: '/api/auth/login-cpf', // New CPF Only
    INVOICES: '/api/invoices',
    CONTRACTS: '/api/contracts',
    BOLETO: '/api/boleto',
    ONT: '/api/ont',
    SPEEDTEST: '/api/speedtest',
    NEWS: '/api/news',
    BOT: '/api/bot',
  }
};