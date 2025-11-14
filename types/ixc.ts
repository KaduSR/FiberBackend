// IXC API Types
export interface IXCAuthResponse {
  token: string;
  id_contrato: number;
  nome_cliente: string;
  email: string;
  telefone: string;
  status_contrato: 'Ativo' | 'Vencido' | 'Bloqueado' | 'Cancelado';
}

export interface IXCContractStatus {
  id_contrato: number;
  status_contrato: string;
  plano: string;
  valor_mensalidade: number;
  data_vencimento: string;
  endereco: string;
}

export interface IXCSignalData {
  sinal_rx: number;
  sinal_tx: number;
  status: 'Excelente' | 'Bom' | 'Regular' | 'Ruim';
  ultima_atualizacao: string;
}

export interface IXCInvoice {
  id_fatura: number;
  mes_referencia: string;
  valor: number;
  data_vencimento: string;
  status: 'pago' | 'pendente' | 'vencido';
  data_pagamento?: string;
  linha_digitavel?: string;
  codigo_pix?: string;
}

export interface IXCTicket {
  id_os: number;
  titulo: string;
  descricao: string;
  status: 'aberto' | 'em_andamento' | 'resolvido' | 'cancelado';
  data_abertura: string;
  data_atualizacao?: string;
  categoria: string;
}

export interface IXCResetEquipmentRequest {
  id_contrato: number;
  tipo_reset: 'soft' | 'hard';
}

export interface IXCCreateTicketRequest {
  id_contrato: number;
  assunto: string;
  descricao: string;
  categoria?: string;
}

export interface IXCLoginRequest {
  login: string;
  senha: string;
}

export interface IXCAPIError {
  error: string;
  message: string;
  code?: number;
}
