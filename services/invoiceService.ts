import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { 
  IXCInvoice,
  IXCFatura,
  IXCFaturaResponse,
  IXCBoletoRequest,
  IXCBoletoResponse
} from '@/types/ixc';

export const invoiceService = {
  /**
   * Busca as faturas (em aberto e pagas) de um cliente específico.
   * (Método Alternativo: usa /fn_areceber com id_cliente)
   */
  async getInvoices(idCliente: string): Promise<IXCFatura[]> {
    try {
      // Prepara o corpo da requisição
      const requestBody = {
        qtype: 'fn_areceber.id_cliente',
        query: idCliente, // Filtra pelo ID do cliente logado
        oper: '=',
        page: '1',
        rp: '50', // Pega as últimas 50 faturas
        sortname: 'fn_areceber.data_vencimento',
        sortorder: 'desc',
      };

      // Chama o 'postList' (com header 'ixcsoft: listar')
      const response = await ixcApi.postList<IXCFaturaResponse>(
        IXC_CONFIG.ENDPOINTS.FN_ARECEBER,
        requestBody
      );

      if (response.total > 0) {
        return response.registros;
      }
      
      return []; // Retorna lista vazia se não houver faturas

    } catch (error) {
      console.error('Erro ao buscar faturas:', error);
      throw new Error('Não foi possível carregar as faturas.');
    }
  },

  /**
   * Busca um boleto específico em formato Base64.
   * (Método Alternativo: usa /get_boleto)
   */
  async getBoletoAsBase64(idBoleto: string): Promise<string> {
    try {
      // Prepara o corpo da requisição
      const requestBody: IXCBoletoRequest = {
        boletos: idBoleto, // O ID da fatura (ex: "223485")
        atualiza_boleto: 'S',
        tipo_boleto: 'arquivo',
        base64: 'S'
      };

      // Chama o 'post' normal (sem o header 'listar')
      const response = await ixcApi.post<IXCBoletoResponse>(
        IXC_CONFIG.ENDPOINTS.GET_BOLETO,
        requestBody
      );

      if (response.file) {
        return response.file; // Retorna a string base64 do PDF
      }

      throw new Error('API não retornou o arquivo do boleto.');

    } catch (error) {
      console.error('Erro ao buscar boleto:', error);
      throw new Error('Não foi possível carregar o boleto.');
    }
  },

  // Método legado - mantido para compatibilidade (usa id_contrato)
  async listInvoices(idContrato: number | string): Promise<IXCInvoice[]> {
    // Usa postList() com filtro por id_contrato
    const searchBody = {
      qtype: 'fn_areacliente_faturas.id_contrato',
      query: String(idContrato),
      oper: '=',
      page: '1',
      rp: '100', // Limite de resultados
      sortname: 'fn_areacliente_faturas.id',
      sortorder: 'desc',
    };

    const response = await ixcApi.postList<{ total: number; registros: IXCInvoice[] }>(
      IXC_CONFIG.ENDPOINTS.FATURAS,
      searchBody
    );

    return response.registros || [];
  },

  async getInvoicePDF(idFatura: number): Promise<{ pdf_url: string; codigo_pix?: string; linha_digitavel?: string }> {
    // Para buscar PDF, pode usar post() normal ou postList() dependendo da API
    return ixcApi.post<{ pdf_url: string; codigo_pix?: string; linha_digitavel?: string }>(
      IXC_CONFIG.ENDPOINTS.FATURAS,
      { id_fatura: idFatura }
    );
  },

  // Mock for development
  async mockListInvoices(idContrato: number): Promise<IXCInvoice[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const invoices: IXCInvoice[] = [];
    
    for (let i = 0; i < 3; i++) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month < 0 ? 12 + month : month;
      
      const dueDate = new Date(year, adjustedMonth, 10);
      const isPast = dueDate < today;
      const isPaid = i > 0; // Current month pending, others paid

      invoices.push({
        id_fatura: 1000 + i,
        mes_referencia: dueDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
        valor: 129.90,
        data_vencimento: dueDate.toLocaleDateString('pt-BR'),
        status: isPaid ? 'pago' : (isPast ? 'vencido' : 'pendente'),
        data_pagamento: isPaid ? new Date(year, adjustedMonth, 9).toLocaleDateString('pt-BR') : undefined,
        codigo_pix: !isPaid ? '00020126580014br.gov.bcb.pix...' : undefined,
      });
    }

    return invoices;
  },

  async mockGetInvoicePDF(idFatura: number): Promise<{ pdf_url: string; codigo_pix?: string; linha_digitavel?: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      pdf_url: `https://fibernet.com.br/faturas/${idFatura}.pdf`,
      codigo_pix: '00020126580014br.gov.bcb.pix0136chave@fibernet.com.br52040000530398654041.005802BR5913FIBERNET',
      linha_digitavel: '00190.00009 01234.567890 12345.678901 2 12340000012990',
    };
  },
};
