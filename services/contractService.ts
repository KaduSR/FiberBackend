import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { 
  IXCContractStatus, 
  IXCSignalData,
  IXCContrato,
  IXCContratoResponse
} from '@/types/ixc';

export const contractService = {
  /**
   * Busca os contratos de um cliente específico.
   * (Método Alternativo: usa /cliente_contrato com id_cliente)
   */
  async getContracts(idCliente: string): Promise<IXCContrato[]> {
    try {
      // Prepara o corpo da requisição (JSON de pesquisa)
      const requestBody = {
        qtype: 'cliente_contrato.id_cliente',
        query: idCliente, // Filtra pelo ID do cliente logado
        oper: '=',
        page: '1',
        rp: '10', // Pega os últimos 10 contratos
        sortname: 'cliente_contrato.id',
        sortorder: 'desc',
      };

      // Chama o 'postList' (com header 'ixcsoft: listar')
      const response = await ixcApi.postList<IXCContratoResponse>(
        IXC_CONFIG.ENDPOINTS.CONTRATO,
        requestBody
      );

      if (response.total > 0) {
        // Converte IXCContratoRegistro[] para IXCContrato[]
        return response.registros as IXCContrato[];
      }
      
      return []; // Retorna lista vazia se não houver contratos

    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
      throw new Error('Não foi possível carregar os contratos.');
    }
  },

  /**
   * Busca um contrato específico pelo ID do contrato.
   */
  async getContractById(idContrato: string): Promise<IXCContrato | null> {
    try {
      const requestBody = {
        qtype: 'cliente_contrato.id',
        query: idContrato,
        oper: '=',
        page: '1',
        rp: '1',
        sortname: 'cliente_contrato.id',
        sortorder: 'asc',
      };

      const response = await ixcApi.postList<IXCContratoResponse>(
        IXC_CONFIG.ENDPOINTS.CONTRATO,
        requestBody
      );

      if (response.total > 0 && response.registros[0]) {
        return response.registros[0] as IXCContrato;
      }
      
      return null;

    } catch (error) {
      console.error('Erro ao buscar contrato pelo ID:', error);
      throw new Error('Não foi possível carregar o contrato.');
    }
  },
  async getContractStatus(idContrato: number | string): Promise<IXCContractStatus> {
    // Busca o contrato usando postList() no endpoint /cliente_contrato
    const searchBody = {
      qtype: 'cliente_contrato.id',
      query: String(idContrato),
      oper: '=',
      page: '1',
      rp: '1',
      sortname: 'cliente_contrato.id',
      sortorder: 'desc',
    };

    const response = await ixcApi.postList<{ total: number; registros: any[] }>(
      IXC_CONFIG.ENDPOINTS.CONTRATO,
      searchBody
    );

    if (response.total === 0 || !response.registros[0]) {
      throw new Error('Contrato não encontrado');
    }

    const contrato = response.registros[0];
    
    // Transforma a resposta para o formato esperado
    return {
      id_contrato: Number(idContrato),
      status_contrato: contrato.status || 'Desconhecido',
      plano: contrato.plano || contrato.descricao_plano || 'N/A',
      valor_mensalidade: contrato.valor || 0,
      data_vencimento: contrato.dia_vencimento || '10',
      endereco: contrato.endereco || contrato.endereco_instalacao || 'N/A',
    };
  },

  async checkSignal(idContrato: number | string): Promise<IXCSignalData> {
    // Para verificar sinal, pode ser necessário usar um endpoint específico
    // Por enquanto, mantém como post() normal (pode ser uma ação, não listagem)
    return ixcApi.post<IXCSignalData>(
      '/consultarSinal', // Endpoint específico para sinal (ajustar se necessário)
      { id_contrato: idContrato }
    );
  },

  // Mock data for development
  async mockGetContractStatus(idContrato: number): Promise<IXCContractStatus> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id_contrato: idContrato,
      status_contrato: 'Ativo',
      plano: 'Fiber Game 500MB',
      valor_mensalidade: 129.90,
      data_vencimento: '10',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
    };
  },

  async mockCheckSignal(idContrato: number): Promise<IXCSignalData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const signalValue = -15 + Math.random() * 10; // Random signal between -15 and -5
    
    let status: IXCSignalData['status'];
    if (signalValue > -10) status = 'Excelente';
    else if (signalValue > -15) status = 'Bom';
    else if (signalValue > -20) status = 'Regular';
    else status = 'Ruim';

    return {
      sinal_rx: signalValue,
      sinal_tx: -5 + Math.random() * 3,
      status,
      ultima_atualizacao: new Date().toISOString(),
    };
  },
};
