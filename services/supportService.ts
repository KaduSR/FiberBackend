import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCTicket, IXCCreateTicketRequest } from '@/types/ixc';

export const supportService = {
  async listTickets(idContrato: number): Promise<IXCTicket[]> {
    return ixcApi.post<IXCTicket[]>(
      IXC_CONFIG.ENDPOINTS.LIST_TICKETS,
      { id_contrato: idContrato }
    );
  },

  async createTicket(request: IXCCreateTicketRequest): Promise<{ id_os: number; message: string }> {
    return ixcApi.post<{ id_os: number; message: string }>(
      IXC_CONFIG.ENDPOINTS.CREATE_TICKET,
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
