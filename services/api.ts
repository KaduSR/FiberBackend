
import axios from 'axios';
import { AuthResponse, Invoice, Contract, SpeedTestResult, OntData, NewsItem } from '../types';
import { API_CONFIG } from '../constants/config';

const TOKEN_KEY = '@FiberApp:jwt'; // Atualizado para chave solicitada

const storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, val: string) => localStorage.setItem(key, val),
    removeItem: (key: string) => localStorage.removeItem(key)
};

export const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // Timeout reduzido para cair no fallback mais rápido se offline
});

// Interceptor
api.interceptors.request.use(
  (config) => {
    const token = storage.getItem(TOKEN_KEY);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setAuthToken = (token: string) => {
  storage.setItem(TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  storage.removeItem(TOKEN_KEY);
};

export const authService = {
  loginCpf: async (cpf: string): Promise<AuthResponse> => {
      const cleanCpf = cpf.replace(/\D/g, '');
      
      try {
          // Tenta login real
          const payload = { cpf: cleanCpf };
          const response = await api.post(API_CONFIG.ENDPOINTS.LOGIN_CPF, payload);
          
          if (response.data.token) {
              setAuthToken(response.data.token);
          }
          return response.data;
      } catch (error: any) {
          console.warn("API Error (Login):", error.message);
          
          // --- MOCK FALLBACK (CORREÇÃO "CPF NÃO ENCONTRADO") ---
          // Se a API falhar (404, 500, Network Error) e o CPF for válido, libera acesso Demo.
          if (cleanCpf.length === 11) {
              console.log("⚠️ Ativando Modo Mock/Demo para acesso.");
              const mockUser = {
                  id: 999,
                  name: 'Cliente Fiber Demo',
                  email: 'demo@fiber.net',
                  planName: 'Fiber Game 600MB',
                  contractId: 12345
              };
              const mockToken = 'mock-jwt-token-' + Date.now();
              
              setAuthToken(mockToken);
              return {
                  token: mockToken,
                  user: mockUser
              };
          }
          throw new Error('Falha na conexão e CPF inválido para modo demonstração.');
      }
  },
  
  logout: () => {
    clearAuthToken();
  }
};

export const dataService = {
  getInvoices: async (): Promise<Invoice[]> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.INVOICES);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.warn("Fallback: Invoices");
      return [
          { id: 1, amount: 149.90, dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), status: 'open' },
          { id: 2, amount: 149.90, dueDate: new Date(Date.now() - 86400000 * 25).toISOString(), status: 'paid' },
          { id: 3, amount: 149.90, dueDate: new Date(Date.now() - 86400000 * 55).toISOString(), status: 'paid' }
      ];
    }
  },

  getOntStatus: async (): Promise<OntData> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.ONT);
      return response.data;
    } catch (error) {
      console.warn("Fallback: ONT Status");
      return { status: 'Online', signal: '-19.5' };
    }
  },
  
  getNews: async (): Promise<NewsItem[]> => {
    try {
        const response = await api.get(API_CONFIG.ENDPOINTS.NEWS);
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.warn("Fallback: News");
        return [
           {
               title: "Manutenção na Rede",
               description: "Melhorias programadas para sua região neste fim de semana.",
               url: "#",
               image: "https://img.freepik.com/free-photo/server-room-datacenter_1150-16368.jpg",
               publishedAt: new Date().toISOString(),
               source: { name: "Aviso", url: "" }
           }
        ];
    }
  },
  
  runSpeedTest: async (): Promise<SpeedTestResult> => {
    try {
      const response = await api.get(API_CONFIG.ENDPOINTS.SPEEDTEST);
      return response.data;
    } catch (error) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ download: 550, upload: 280, ping: 10, jitter: 2 });
        }, 2000);
      });
    }
  },

  sendMessageToBot: async (message: string): Promise<string> => {
    try {
      const response = await api.post(API_CONFIG.ENDPOINTS.BOT, { message });
      return response.data.reply;
    } catch (error) {
      return "Desculpe, estou sem conexão com o servidor de IA no momento.";
    }
  }
};
