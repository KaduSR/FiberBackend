import { IXC_CONFIG } from '@/constants/config';
import type { IXCAPIError } from '@/types/ixc';

class IXCApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = IXC_CONFIG.BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  getAuthHeader(): Record<string, string> {
    if (!this.token) {
      return {};
    }
    // Convert token to Base64 as required by IXC
    const base64Token = btoa(this.token);
    return {
      'Authorization': `Basic ${base64Token}`,
    };
  }

  async post<T>(endpoint: string, data: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleError(response.status, errorData);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido ao comunicar com o servidor');
    }
  }

  private handleError(status: number, errorData: unknown): Error {
    const apiError = errorData as IXCAPIError;
    
    switch (status) {
      case 401:
        return new Error('Sessão expirada. Por favor, faça login novamente.');
      case 403:
        return new Error('Acesso negado. Verifique suas permissões.');
      case 404:
        return new Error('Serviço não encontrado.');
      case 500:
        return new Error(apiError.message || 'Erro no servidor. Tente novamente mais tarde.');
      default:
        return new Error(apiError.message || `Erro ${status}: Não foi possível completar a operação.`);
    }
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    attempts: number = IXC_CONFIG.RETRY_ATTEMPTS
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < attempts; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < attempts - 1) {
          await this.delay(IXC_CONFIG.RETRY_DELAY * (i + 1));
        }
      }
    }

    throw lastError || new Error('Operação falhou após múltiplas tentativas');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const ixcApi = new IXCApiClient();
