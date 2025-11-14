import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCAuthResponse, IXCLoginRequest } from '@/types/ixc';

export const authService = {
  async login(credentials: IXCLoginRequest): Promise<IXCAuthResponse> {
    try {
      const response = await ixcApi.post<IXCAuthResponse>(
        IXC_CONFIG.ENDPOINTS.LOGIN,
        credentials
      );

      // Store token for subsequent requests
      if (response.token) {
        ixcApi.setToken(response.token);
      }

      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro no login: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao fazer login');
    }
  },

  logout() {
    ixcApi.clearToken();
  },

  /**
   * Mock login for development
   * 
   * Conforme IXC API: login com e-mail e senha
   * Credenciais demo: test@fibernet.com / 123456
   */
  async mockLogin(email: string, senha: string): Promise<IXCAuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (email === 'test@fibernet.com' && senha === '123456') {
      const mockResponse: IXCAuthResponse = {
        token: 'mock_token_' + Date.now(),
        id_contrato: 12345,
        nome_cliente: 'João Silva',
        email: 'test@fibernet.com',
        telefone: '(11) 99999-9999',
        status_contrato: 'Ativo',
      };
      
      ixcApi.setToken(mockResponse.token);
      return mockResponse;
    }

    throw new Error('E-mail ou senha inválidos');
  },
};
