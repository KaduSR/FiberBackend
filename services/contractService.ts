import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCContractStatus, IXCSignalData } from '@/types/ixc';

export const contractService = {
  async getContractStatus(idContrato: number): Promise<IXCContractStatus> {
    return ixcApi.post<IXCContractStatus>(
      IXC_CONFIG.ENDPOINTS.CONTRACT_STATUS,
      { id_contrato: idContrato }
    );
  },

  async checkSignal(idContrato: number): Promise<IXCSignalData> {
    return ixcApi.post<IXCSignalData>(
      IXC_CONFIG.ENDPOINTS.SIGNAL_CHECK,
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
