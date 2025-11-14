import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCInvoice } from '@/types/ixc';

export const invoiceService = {
  async listInvoices(idContrato: number): Promise<IXCInvoice[]> {
    return ixcApi.post<IXCInvoice[]>(
      IXC_CONFIG.ENDPOINTS.LIST_INVOICES,
      { id_contrato: idContrato }
    );
  },

  async getInvoicePDF(idFatura: number): Promise<{ pdf_url: string; codigo_pix?: string; linha_digitavel?: string }> {
    return ixcApi.post<{ pdf_url: string; codigo_pix?: string; linha_digitavel?: string }>(
      IXC_CONFIG.ENDPOINTS.GET_INVOICE_PDF,
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
