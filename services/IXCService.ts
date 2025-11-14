/**
 * IXCService - Central Data Service Class
 * 
 * Encapsulates all secure and autonomous communication logic with IXC ERP.
 * Handles authentication, token management, and API requests with Base64 encoded tokens.
 */

import { IXC_CONFIG } from '@/constants/config';
import type { 
  IXCAuthResponse, 
  IXCSignalData, 
  IXCInvoice, 
  IXCAPIError 
} from '@/types/ixc';

class IXCService {
  private _token: string | null = null;
  private _idContrato: number | null = null;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || IXC_CONFIG.BASE_URL + '/webservice/Sessao_Usuario_Controle';
  }

  /**
   * Authentication Method
   * Authenticates with IXC ERP and stores token and contract ID
   * 
   * IMPORTANTE: Conforme documentação IXC (https://wikiapiprovedor.ixcsoft.com.br/#6)
   * Para acesso ao hotsite (área do cliente), usar:
   * - login: E-mail do cliente
   * - senha: Senha do cliente
   * 
   * @param email - User email (login)
   * @param senha - User password
   * @throws Error if authentication fails
   */
  async login(email: string, senha: string): Promise<IXCAuthResponse> {
    try {
      const endpoint = '/login_token';
      const payload = {
        login: email,
        senha: senha,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
        timeout: IXC_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        const errorData: IXCAPIError = await response.json().catch(() => ({
          error: 'API_ERROR',
          message: `HTTP Error: ${response.status}`,
        }));
        throw new Error(errorData.message || 'Falha na autenticação');
      }

      const data: IXCAuthResponse = await response.json();

      if (!data.token || !data.id_contrato) {
        throw new Error('Resposta inválida do servidor: token ou id_contrato ausente');
      }

      // Store token and contract ID internally
      this._token = data.token;
      this._idContrato = data.id_contrato;

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro no login: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao fazer login');
    }
  }

  /**
   * Secure Fetch Method (Private)
   * 
   * CRITICAL: Ensures token is available and encodes it to Base64
   * Executes POST request with Authorization header
   * 
   * @param endpoint - API endpoint path
   * @param data - Request payload
   * @returns Parsed response data
   * @throws Error if token is not available or request fails
   */
  private async _secureFetch<T>(endpoint: string, data?: any): Promise<T> {
    if (!this._token) {
      throw new Error('Token não encontrado. Por favor, faça login primeiro.');
    }

    if (!this._idContrato) {
      throw new Error('ID do contrato não encontrado. Por favor, faça login primeiro.');
    }

    try {
      // Encode token to Base64
      const encodedToken = Buffer.from(this._token).toString('base64');

      // Prepare payload with contract ID
      const payload = {
        id_contrato: this._idContrato,
        ...data,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${encodedToken}`, // Critical: Base64 encoded token
        },
        body: JSON.stringify(payload),
        timeout: IXC_CONFIG.TIMEOUT,
      });

      if (!response.ok) {
        const errorData: IXCAPIError = await response.json().catch(() => ({
          error: 'API_ERROR',
          message: `HTTP Error: ${response.status}`,
          code: response.status,
        }));
        throw new Error(errorData.message || `Erro na requisição: ${response.status}`);
      }

      const responseData: T = await response.json();
      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro na requisição segura: ${error.message}`);
      }
      throw new Error('Erro desconhecido na requisição');
    }
  }

  /**
   * Check Signal Quality
   * Queries the optical signal quality from the equipment
   * 
   * @returns Signal data including RX/TX values and status
   * @throws Error if not authenticated or request fails
   */
  async consultarSinal(): Promise<IXCSignalData> {
    return this._secureFetch<IXCSignalData>('/consultarSinal');
  }

  /**
   * Get Invoices
   * Retrieves all invoices for the authenticated contract
   * 
   * @returns Array of invoices with payment status
   * @throws Error if not authenticated or request fails
   */
  async getFaturas(): Promise<IXCInvoice[]> {
    return this._secureFetch<IXCInvoice[]>('/getFaturas');
  }

  /**
   * Reset Equipment
   * Remotely resets the customer's equipment
   * 
   * @param tipoReset - Type of reset ('soft' or 'hard')
   * @returns Success status and message
   * @throws Error if not authenticated or request fails
   */
  async resetarEquipamento(tipoReset: 'soft' | 'hard' = 'soft'): Promise<{ success: boolean; message: string }> {
    return this._secureFetch<{ success: boolean; message: string }>('/resetarEquipamento', {
      tipo_reset: tipoReset,
    });
  }

  /**
   * Get Contract Status
   * Retrieves current contract status and plan details
   * 
   * @returns Contract status information
   * @throws Error if not authenticated or request fails
   */
  async getContractStatus(): Promise<any> {
    return this._secureFetch('/getContractStatus');
  }

  /**
   * Get Invoice PDF
   * Retrieves PDF and payment details for a specific invoice
   * 
   * @param idFatura - Invoice ID
   * @returns Invoice PDF URL and payment codes
   * @throws Error if not authenticated or request fails
   */
  async getFaturaPDF(idFatura: number): Promise<any> {
    return this._secureFetch('/getFaturaPDF', {
      id_fatura: idFatura,
    });
  }

  /**
   * Create Service Ticket
   * Opens a new technical support ticket
   * 
   * @param assunto - Ticket subject
   * @param descricao - Detailed description
   * @returns Created ticket information
   * @throws Error if not authenticated or request fails
   */
  async abrirOS(assunto: string, descricao: string): Promise<any> {
    return this._secureFetch('/abrirOS', {
      assunto,
      descricao,
    });
  }

  /**
   * List Service Tickets
   * Retrieves all service tickets for the authenticated contract
   * 
   * @returns Array of service tickets
   * @throws Error if not authenticated or request fails
   */
  async listarOS(): Promise<any[]> {
    return this._secureFetch('/listarOS');
  }

  /**
   * Logout
   * Clears stored token and contract ID
   */
  logout(): void {
    this._token = null;
    this._idContrato = null;
  }

  /**
   * Check Authentication Status
   * 
   * @returns True if token is available
   */
  isAuthenticated(): boolean {
    return this._token !== null && this._idContrato !== null;
  }

  /**
   * Get Current Contract ID
   * 
   * @returns Contract ID or null if not authenticated
   */
  getContractId(): number | null {
    return this._idContrato;
  }

  /**
   * Set Token and Contract ID (for session restoration)
   * 
   * @param token - Authentication token
   * @param idContrato - Contract ID
   */
  setSession(token: string, idContrato: number): void {
    this._token = token;
    this._idContrato = idContrato;
  }
}

// Export singleton instance
export const ixcService = new IXCService();

// Export class for testing or custom instances
export { IXCService };
