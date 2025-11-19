
export const API_BASE_URL = 'https://api.centralfiber.online';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    LOGIN: '/api/auth/login', // Legacy
    LOGIN_CPF: '/api/auth/login-cpf',
    INVOICES: '/api/invoices',
    CONTRACTS: '/api/contracts',
    ONT: '/api/ont/status', // Atualizado conforme solicitado
    SPEEDTEST: '/api/speedtest',
    NEWS: '/api/news',
    BOT: '/api/bot',
    INSTABILITIES: '/api/instabilities'
  }
};
