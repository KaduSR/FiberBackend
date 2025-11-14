/**
 * ONT Devices Service
 * Serviço para gerenciamento de dispositivos conectados à ONT Huawei
 * 
 * IMPORTANTE: Para acesso real aos dispositivos da ONT, é necessário:
 * 
 * 1. Backend com TR-069/CWMP (protocolo de gerenciamento remoto)
 * 2. Integração com ACS (Auto Configuration Server) do IXC
 * 3. Credenciais de acesso administrativo à ONT
 * 
 * Protocolos suportados pelas ONTs Huawei:
 * - TR-069 (CWMP) - Gerenciamento remoto via ACS
 * - SNMP - Monitoramento e coleta de dados
 * - HTTP API - Interface web da ONT (se habilitada)
 * 
 * Endpoints típicos de ONT Huawei via TR-069:
 * - InternetGatewayDevice.LANDevice.{i}.Hosts.Host.{i}
 * - Device.Hosts.Host.{i}
 * - Device.WiFi.AccessPoint.{i}.AssociatedDevice.{i}
 */

export interface ConnectedDevice {
  id: string;
  name: string;
  ipAddress: string;
  macAddress: string;
  connectionType: 'wifi' | 'ethernet';
  signalStrength?: number; // WiFi only (0-100)
  connected: boolean;
  connectedSince?: string;
  bandwidth?: {
    download: number; // Mbps
    upload: number;   // Mbps
  };
  manufacturer?: string;
  deviceType?: 'smartphone' | 'computer' | 'tablet' | 'tv' | 'console' | 'iot' | 'unknown';
}

export interface ONTInfo {
  model: string;
  serialNumber: string;
  firmwareVersion: string;
  opticalPower: {
    rx: number; // dBm
    tx: number; // dBm
  };
  uptime: number; // seconds
  temperature?: number; // Celsius
}

class ONTDevicesService {
  private apiBaseUrl: string;
  private apiKey: string;

  constructor() {
    // URL do seu backend que se comunica com a ONT via TR-069/GenieACS
    this.apiBaseUrl = process.env.EXPO_PUBLIC_ONT_API_URL || '';
    this.apiKey = process.env.EXPO_PUBLIC_ONT_API_KEY || '';
  }

  /**
   * Obtém informações da ONT
   * 
   * Requer backend com acesso TR-069 à ONT do cliente
   */
  async getONTInfo(contractId: string): Promise<ONTInfo> {
    try {
      if (!this.apiBaseUrl) {
        // Retorna dados mock se API não configurada
        return this.getMockONTInfo();
      }

      const response = await fetch(`${this.apiBaseUrl}/ont/${contractId}/info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting ONT info:', error);
      return this.getMockONTInfo();
    }
  }

  /**
   * Lista dispositivos conectados à ONT
   * 
   * Requer backend com acesso TR-069 à ONT:
   * - InternetGatewayDevice.LANDevice.1.Hosts.Host.{i}
   * - Device.Hosts.Host.{i}
   */
  async getConnectedDevices(contractId: string): Promise<ConnectedDevice[]> {
    try {
      if (!this.apiBaseUrl) {
        // Retorna dados mock se API não configurada
        return this.getMockDevices();
      }

      const response = await fetch(`${this.apiBaseUrl}/ont/${contractId}/devices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting connected devices:', error);
      return this.getMockDevices();
    }
  }

  /**
   * Bloqueia/desbloqueia dispositivo na ONT
   * 
   * Requer backend com permissão de escrita via TR-069
   */
  async toggleDeviceBlock(contractId: string, macAddress: string, block: boolean): Promise<boolean> {
    try {
      if (!this.apiBaseUrl) {
        console.log('Mock: Device block toggled');
        return true;
      }

      const response = await fetch(`${this.apiBaseUrl}/ont/${contractId}/device/${macAddress}/block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
        body: JSON.stringify({ block }),
      });

      return response.ok;
    } catch (error) {
      console.error('Error toggling device block:', error);
      return false;
    }
  }

  /**
   * Reinicia a ONT remotamente
   * 
   * Requer backend com permissão via TR-069:
   * - Device.DeviceInfo.Reboot
   */
  async rebootONT(contractId: string): Promise<boolean> {
    try {
      if (!this.apiBaseUrl) {
        console.log('Mock: ONT reboot initiated');
        return true;
      }

      const response = await fetch(`${this.apiBaseUrl}/ont/${contractId}/reboot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'x-api-key': this.apiKey }),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error rebooting ONT:', error);
      return false;
    }
  }

  /**
   * Identifica tipo de dispositivo baseado no MAC address
   */
  private detectDeviceType(mac: string, name: string): ConnectedDevice['deviceType'] {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('iphone') || lowerName.includes('android') || lowerName.includes('galaxy')) {
      return 'smartphone';
    }
    if (lowerName.includes('notebook') || lowerName.includes('desktop') || lowerName.includes('pc')) {
      return 'computer';
    }
    if (lowerName.includes('ipad') || lowerName.includes('tablet')) {
      return 'tablet';
    }
    if (lowerName.includes('tv') || lowerName.includes('smarttv')) {
      return 'tv';
    }
    if (lowerName.includes('playstation') || lowerName.includes('xbox') || lowerName.includes('switch')) {
      return 'console';
    }
    if (lowerName.includes('alexa') || lowerName.includes('google home') || lowerName.includes('camera')) {
      return 'iot';
    }
    
    return 'unknown';
  }

  /**
   * Dados mock da ONT
   */
  private getMockONTInfo(): ONTInfo {
    return {
      model: 'Huawei HG8245H5',
      serialNumber: 'HWTC12345678',
      firmwareVersion: 'V5R021C10S125',
      opticalPower: {
        rx: -18.5, // Excelente: -8 a -25 dBm
        tx: 2.3,
      },
      uptime: 1234567, // ~14 dias
      temperature: 42,
    };
  }

  /**
   * Dispositivos mock para demonstração
   */
  private getMockDevices(): ConnectedDevice[] {
    return [
      {
        id: '1',
        name: 'iPhone 13 Pro',
        ipAddress: '192.168.1.100',
        macAddress: '00:11:22:33:44:55',
        connectionType: 'wifi',
        signalStrength: 92,
        connected: true,
        connectedSince: new Date(Date.now() - 3600000 * 2).toISOString(),
        bandwidth: {
          download: 120.5,
          upload: 45.2,
        },
        manufacturer: 'Apple',
        deviceType: 'smartphone',
      },
      {
        id: '2',
        name: 'Samsung Smart TV',
        ipAddress: '192.168.1.101',
        macAddress: 'AA:BB:CC:DD:EE:FF',
        connectionType: 'ethernet',
        connected: true,
        connectedSince: new Date(Date.now() - 86400000).toISOString(),
        bandwidth: {
          download: 85.3,
          upload: 12.1,
        },
        manufacturer: 'Samsung',
        deviceType: 'tv',
      },
      {
        id: '3',
        name: 'PlayStation 5',
        ipAddress: '192.168.1.102',
        macAddress: '11:22:33:44:55:66',
        connectionType: 'ethernet',
        connected: true,
        connectedSince: new Date(Date.now() - 7200000).toISOString(),
        bandwidth: {
          download: 280.7,
          upload: 95.4,
        },
        manufacturer: 'Sony',
        deviceType: 'console',
      },
      {
        id: '4',
        name: 'Notebook Dell',
        ipAddress: '192.168.1.103',
        macAddress: '77:88:99:AA:BB:CC',
        connectionType: 'wifi',
        signalStrength: 78,
        connected: true,
        connectedSince: new Date(Date.now() - 14400000).toISOString(),
        bandwidth: {
          download: 156.2,
          upload: 67.8,
        },
        manufacturer: 'Dell',
        deviceType: 'computer',
      },
      {
        id: '5',
        name: 'Alexa Echo Dot',
        ipAddress: '192.168.1.104',
        macAddress: 'DD:EE:FF:00:11:22',
        connectionType: 'wifi',
        signalStrength: 65,
        connected: true,
        connectedSince: new Date(Date.now() - 172800000).toISOString(),
        bandwidth: {
          download: 2.5,
          upload: 0.8,
        },
        manufacturer: 'Amazon',
        deviceType: 'iot',
      },
      {
        id: '6',
        name: 'Galaxy Tab S8',
        ipAddress: '192.168.1.105',
        macAddress: '33:44:55:66:77:88',
        connectionType: 'wifi',
        signalStrength: 88,
        connected: false,
        manufacturer: 'Samsung',
        deviceType: 'tablet',
      },
    ];
  }
}

export const ontDevicesService = new ONTDevicesService();
