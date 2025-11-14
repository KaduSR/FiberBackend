// IXC API Types
export interface IXCAuthResponse {
  token: string;
  id_contrato: number;
  nome_cliente: string;
  email: string;
  telefone: string;
  status_contrato: 'Ativo' | 'Vencido' | 'Bloqueado' | 'Cancelado';
}

// Novo tipo para dados do usuário autenticado (sem token de sessão)
export interface AuthUserData {
  id_cliente: string;
  id_contrato: string;
  nome_cliente: string;
  email: string;
  telefone: string;
  status_contrato: string;
}

// Tipos para resposta do endpoint /cliente
export interface IXCClienteRegistro {
  id: string;
  razao: string;
  hotsite_email: string;
  senha: string; // Campo inseguro que será usado para validação
  telefone_celular: string;
  cnpj_cpf?: string;
  [key: string]: any; // Permite campos adicionais do JSON
}

export interface IXCClienteResponse {
  total: number;
  registros: IXCClienteRegistro[];
}

// Tipos para resposta do endpoint /cliente_contrato
export interface IXCContratoRegistro {
  id: string;
  id_cliente: string;
  status: string; // "Ativo", "Bloqueado", etc.
  [key: string]: any; // Permite campos adicionais do JSON
}

export interface IXCContratoResponse {
  total: number;
  registros: IXCContratoRegistro[];
}

// Tipo específico para contrato (com campos nomeados para uso no contractService)
export interface IXCContrato {
  id: string;
  id_cliente: string;
  status: string; // "Ativo", "Bloqueado", "Cancelado"
  descricao_aux_plano_venda: string; // Nome do Plano
  data_ativacao: string;
  [key: string]: any; // Permite campos adicionais do JSON
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

// Tipos para resposta do endpoint /fn_areceber
export interface IXCFatura {
  id: string;
  id_cliente: string;
  data_vencimento: string;
  valor: string;
  status: 'A' | 'B'; // A = Aberto, B = Baixado
  linha_digitavel: string;
  [key: string]: any; // Permite campos adicionais do JSON
}

export interface IXCFaturaResponse {
  total: number;
  registros: IXCFatura[];
}

// Tipos para o endpoint /get_boleto
export interface IXCBoletoRequest {
  boletos: string; // ID da fatura (campo 'id' do fn_areceber)
  juro?: 'S' | 'N';
  multa?: 'S' | 'N';
  atualiza_boleto: 'S';
  tipo_boleto: 'arquivo';
  base64: 'S';
}

export interface IXCBoletoResponse {
  file: string; // O boleto em base64
  [key: string]: any; // Permite campos adicionais do JSON
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
