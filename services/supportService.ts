import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCTicket, IXCCreateTicketRequest } from '@/types/ixc';

export const supportService = {
  async listTickets(idContrato: number | string): Promise<IXCTicket[]> {
    // Usa postList() com filtro por id_contrato
    const searchBody = {
      qtype: 'su_oss_chamado.id_contrato',
      query: String(idContrato),
      oper: '=',
      page: '1',
      rp: '100', // Limite de resultados
      sortname: 'su_oss_chamado.id',
      sortorder: 'desc',
    };

    const response = await ixcApi.postList<{ total: number; registros: IXCTicket[] }>(
      IXC_CONFIG.ENDPOINTS.SUPORTE,
      searchBody
    );

    return response.registros || [];
  },

  async createTicket(request: IXCCreateTicketRequest): Promise<{ id_os: number; message: string }> {
    // Para criar ticket, usa post() normal (ação, não listagem)
    return ixcApi.post<{ id_os: number; message: string }>(
      IXC_CONFIG.ENDPOINTS.SUPORTE,
      request
    );
  },

  // Mock for development
  async mockListTickets(idContrato: number): Promise<IXCTicket[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [
      {
        id_os: 1001,
        titulo: 'Lentidão na conexão',
        descricao: 'Internet está lenta principalmente à noite',
        status: 'resolvido',
        data_abertura: new Date(2025, 10, 5).toLocaleDateString('pt-BR'),
        data_atualizacao: new Date(2025, 10, 6).toLocaleDateString('pt-BR'),
        categoria: 'Técnico',
      },
      {
        id_os: 1002,
        titulo: 'Dúvida sobre fatura',
        descricao: 'Gostaria de entender melhor os valores cobrados',
        status: 'em_andamento',
        data_abertura: new Date(2025, 10, 8).toLocaleDateString('pt-BR'),
        categoria: 'Financeiro',
      },
    ];
  },

  async mockCreateTicket(request: IXCCreateTicketRequest): Promise<{ id_os: number; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id_os: 1003 + Math.floor(Math.random() * 1000),
      message: 'Chamado aberto com sucesso! Nossa equipe entrará em contato em breve.',
    };
  },
};
