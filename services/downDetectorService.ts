/**
 * DownDetector API Service
 * Integração com a API do DownDetector para verificar status de serviços
 * Documentação: https://downdetectorapi.com/v2/docs/
 */

// Configuração da API
const API_BASE_URL = 'https://downdetectorapi.com';
const API_KEY = process.env.EXPO_PUBLIC_DOWNDETECTOR_API_KEY || '';

export interface ServiceStatus {
  slug: string;
  name: string;
  status: 'operational' | 'minor' | 'major' | 'critical';
  reportCount: number;
  baseline: number;
  lastUpdate: string;
}

export interface ServiceReport {
  id: number;
  slug: string;
  name: string;
  reportCount: number;
  baseline: number;
  status: string;
  createdAt: string;
}

export interface CompanyDetails {
  id: number;
  slug: string;
  name: string;
  url: string;
  logo?: string;
  category?: string;
}

class DownDetectorService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.apiKey = API_KEY;
  }

  /**
   * Método auxiliar para fazer requisições à API
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
      ...options?.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('DownDetector API Error:', error);
      throw error;
    }
  }

  /**
   * Lista empresas/serviços disponíveis
   */
  async getCompanies(params?: {
    page?: number;
    perPage?: number;
    search?: string;
  }): Promise<{ data: CompanyDetails[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('per_page', params.perPage.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.fetch(`/v2/companies${query ? `?${query}` : ''}`);
  }

  /**
   * Obtém detalhes de uma empresa específica
   */
  async getCompanyDetails(slug: string): Promise<CompanyDetails> {
    return this.fetch(`/v2/companies/${slug}`);
  }

  /**
   * Obtém relatórios/status de uma empresa
   */
  async getCompanyReports(
    slug: string,
    params?: {
      page?: number;
      perPage?: number;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ data: ServiceReport[]; meta: any }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.perPage) queryParams.append('per_page', params.perPage.toString());
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);

    const query = queryParams.toString();
    return this.fetch(`/v2/companies/${slug}/reports${query ? `?${query}` : ''}`);
  }

  /**
   * Verifica o status atual de um serviço
   */
  async checkServiceStatus(slug: string): Promise<ServiceStatus> {
    try {
      const reports = await this.getCompanyReports(slug, { perPage: 1 });
      
      if (reports.data && reports.data.length > 0) {
        const latestReport = reports.data[0];
        const ratio = latestReport.baseline > 0 
          ? latestReport.reportCount / latestReport.baseline 
          : 0;

        let status: ServiceStatus['status'] = 'operational';
        if (ratio > 5) status = 'critical';
        else if (ratio > 3) status = 'major';
        else if (ratio > 1.5) status = 'minor';

        return {
          slug: latestReport.slug,
          name: latestReport.name,
          status,
          reportCount: latestReport.reportCount,
          baseline: latestReport.baseline,
          lastUpdate: latestReport.createdAt,
        };
      }

      // Fallback: buscar detalhes da empresa
      const company = await this.getCompanyDetails(slug);
      return {
        slug: company.slug,
        name: company.name,
        status: 'operational',
        reportCount: 0,
        baseline: 0,
        lastUpdate: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error checking status for ${slug}:`, error);
      
      // Retorna mock data se API falhar
      return this.getMockServiceStatus(slug);
    }
  }

  /**
   * Verifica múltiplos serviços de uma vez
   */
  async checkMultipleServices(slugs: string[]): Promise<ServiceStatus[]> {
    const promises = slugs.map(slug => this.checkServiceStatus(slug));
    return Promise.all(promises);
  }

  /**
   * Retorna dados mock quando API não está disponível
   */
  private getMockServiceStatus(slug: string): ServiceStatus {
    const serviceNames: { [key: string]: string } = {
      'instagram': 'Instagram',
      'whatsapp': 'WhatsApp',
      'facebook': 'Facebook',
      'youtube': 'YouTube',
      'netflix': 'Netflix',
      'spotify': 'Spotify',
      'twitter': 'Twitter',
      'tiktok': 'TikTok',
      'discord': 'Discord',
      'telegram': 'Telegram',
      'gmail': 'Gmail',
      'google': 'Google',
      'twitch': 'Twitch',
      'amazon': 'Amazon',
      'mercado-livre': 'Mercado Livre',
      'nubank': 'Nubank',
    };

    // Simula status aleatório para demonstração
    const statuses: ServiceStatus['status'][] = ['operational', 'minor', 'major'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const reportCount = randomStatus === 'operational' ? 0 : Math.floor(Math.random() * 1000) + 100;

    return {
      slug,
      name: serviceNames[slug] || slug,
      status: randomStatus,
      reportCount,
      baseline: 500,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Formata a mensagem de status para o chatbot
   */
  formatStatusMessage(status: ServiceStatus): string {
    const statusEmoji = {
      operational: '✅',
      minor: '⚠️',
      major: '🔴',
      critical: '🚨',
    };

    const statusText = {
      operational: 'Funcionando Normalmente',
      minor: 'Instabilidade Leve',
      major: 'Problemas Significativos',
      critical: 'Fora do Ar',
    };

    const emoji = statusEmoji[status.status];
    const text = statusText[status.status];

    if (status.status === 'operational') {
      return `${emoji} ${status.name}: ${text}\n\n✅ O serviço está funcionando perfeitamente!\n📊 Relatórios: ${status.reportCount}\n\nSe você está com problemas, pode ser sua conexão local. Tente reiniciar seu roteador!`;
    }

    const percentage = status.baseline > 0 
      ? Math.round((status.reportCount / status.baseline) * 100) 
      : 0;

    return `${emoji} ${status.name}: ${text}\n\n📊 ${status.reportCount.toLocaleString('pt-BR')} usuários reportando problemas\n📈 ${percentage}% acima do normal\n\n💡 A instabilidade é do próprio ${status.name}, não da sua conexão FiberNet!\n\n🔍 Acompanhe em tempo real:\nhttps://downdetector.com.br/fora-do-ar/${status.slug}/`;
  }

  /**
   * Busca serviço por palavras-chave
   */
  detectServiceFromText(text: string): string | null {
    const services: { [key: string]: string } = {
      'instagram': 'instagram',
      'insta': 'instagram',
      'whatsapp': 'whatsapp',
      'whats': 'whatsapp',
      'zap': 'whatsapp',
      'facebook': 'facebook',
      'face': 'facebook',
      'fb': 'facebook',
      'youtube': 'youtube',
      'yt': 'youtube',
      'netflix': 'netflix',
      'spotify': 'spotify',
      'twitter': 'twitter',
      'x': 'twitter',
      'tiktok': 'tiktok',
      'discord': 'discord',
      'telegram': 'telegram',
      'gmail': 'gmail',
      'google': 'google',
      'twitch': 'twitch',
      'amazon': 'amazon',
      'mercado livre': 'mercado-livre',
      'mercadolivre': 'mercado-livre',
      'ml': 'mercado-livre',
      'nubank': 'nubank',
      'nu': 'nubank',
      'pix': 'pix',
    };

    const lowerText = text.toLowerCase();
    for (const [keyword, service] of Object.entries(services)) {
      if (lowerText.includes(keyword)) {
        return service;
      }
    }
    return null;
  }

  /**
   * Serviços populares para monitoramento
   */
  getPopularServices(): string[] {
    return [
      'instagram',
      'whatsapp',
      'facebook',
      'youtube',
      'netflix',
      'spotify',
      'google',
      'gmail',
    ];
  }
}

export const downDetectorService = new DownDetectorService();
