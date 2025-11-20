import axios from "axios";
import { API_CONFIG } from "../constants/config";

const TOKEN_KEY = "@FiberApp:jwt";

// Adaptador simples para localStorage
const storage = {
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, val: string) => localStorage.setItem(key, val),
  removeItem: (key: string) => localStorage.removeItem(key),
};

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Interceptor: Injeta o Token
api.interceptors.request.use(
  (config) => {
    const token = storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Funções de Token
export const setAuthToken = (token: string) =>
  storage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => storage.removeItem(TOKEN_KEY);

// Serviços de Dados (SEM MOCK DE LOGIN)
export const authService = {
  loginCpf: async (cpf: string) => {
    try {
      const cleanCpf = cpf.replace(/\D/g, "");
      // Chama o backend real
      const { data } = await api.post(API_CONFIG.ENDPOINTS.LOGIN_CPF, {
        cpf: cleanCpf,
      });

      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    } catch (error: any) {
      console.error("Erro Login:", error);
      // Retorna o erro real para a tela exibir
      throw error.response?.data?.error || "Falha ao conectar ao servidor.";
    }
  },

  logout: () => clearAuthToken(),
};

export const dataService = {
  getInvoices: async () => {
    try {
      return (await api.get(API_CONFIG.ENDPOINTS.INVOICES)).data;
    } catch (e) {
      return [];
    }
  },
  getOntStatus: async () => {
    try {
      return (await api.get(`${API_CONFIG.ENDPOINTS.ONT}/status`)).data;
    } catch (e) {
      return { status: "Offline", signal: "N/A" };
    }
  },
  getNews: async () => {
    try {
      return (await api.get(API_CONFIG.ENDPOINTS.NEWS)).data;
    } catch (e) {
      return [];
    }
  },
  runSpeedTest: async () => {
    return (await api.get(API_CONFIG.ENDPOINTS.SPEEDTEST)).data;
  },
  sendMessageToBot: async (message: string) => {
    return (await api.post(API_CONFIG.ENDPOINTS.BOT, { message })).data.reply;
  },
};
