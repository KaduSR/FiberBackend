import { ixcApi } from './ixcApi';
import { IXC_CONFIG } from '@/constants/config';
import type { IXCResetEquipmentRequest } from '@/types/ixc';

export const equipmentService = {
  async resetEquipment(request: IXCResetEquipmentRequest): Promise<{ success: boolean; message: string }> {
    // resetEquipment é uma ação (não listagem), então usa post() normal
    // Nota: O endpoint RESET_EQUIPMENT não está definido no config.ts
    // Pode ser necessário adicionar ou usar um endpoint específico
    return ixcApi.post<{ success: boolean; message: string }>(
      '/resetarEquipamento', // Endpoint específico (ajustar se necessário)
      request
    );
  },

  // Mock for development
  async mockResetEquipment(request: IXCResetEquipmentRequest): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate reset time
    
    return {
      success: true,
      message: `Equipamento reiniciado com sucesso. Aguarde 2-3 minutos para reconexão.`,
    };
  },
};
