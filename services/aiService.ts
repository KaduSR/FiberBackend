/**
 * AI Service
 * Serviço de Inteligência Artificial para o FiberBot
 * 
 * Suporta:
 * - OpenAI (GPT-4)
 * - OnSpace AI
 * - Modo básico (sem IA)
 */

import { customerProfileService } from './customerProfileService';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  message: string;
  action?: 'check_signal' | 'check_downdetector' | 'restart_ont' | 'open_ticket' | 'speedtest';
  service?: string; // Nome do serviço (Instagram, Netflix, etc.)
  learned?: string; // O que a IA aprendeu sobre o cliente
}

class AIService {
  private provider: 'openai' | 'onspace' | 'none';
  private apiKey: string;
  private conversationHistory: Map<string, AIMessage[]> = new Map();

  constructor() {
    this.provider = (process.env.EXPO_PUBLIC_AI_PROVIDER as any) || 'none';
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 
                  process.env.EXPO_PUBLIC_ONSPACE_API_KEY || '';
  }

  /**
   * Gera resposta inteligente do FiberBot
   */
  async generateResponse(
    userId: string,
    userMessage: string,
    context: {
      signalStrength?: number;
      contractStatus?: string;
      lastIssue?: string;
    }
  ): Promise<AIResponse> {
    // Modo básico (sem IA)
    if (this.provider === 'none' || !this.apiKey) {
      return this.generateBasicResponse(userId, userMessage, context);
    }

    try {
      // Obter perfil do cliente
      const profile = await customerProfileService.getProfile(userId);
      
      // Preparar contexto para IA
      const systemPrompt = this.buildSystemPrompt(profile, context);
      const conversation = this.getConversationHistory(userId);
      
      conversation.push({
        role: 'user',
        content: userMessage,
      });

      let aiResponse: string;

      if (this.provider === 'openai') {
        aiResponse = await this.callOpenAI(systemPrompt, conversation);
      } else if (this.provider === 'onspace') {
        aiResponse = await this.callOnSpaceAI(systemPrompt, conversation);
      } else {
        return this.generateBasicResponse(userId, userMessage, context);
      }

      // Adicionar resposta ao histórico
      conversation.push({
        role: 'assistant',
        content: aiResponse,
      });
      this.conversationHistory.set(userId, conversation);

      // Analisar se houve aprendizado
      await this.analyzeAndLearn(userId, userMessage, aiResponse, context);

      // Detectar ação necessária
      const action = this.detectAction(userMessage, aiResponse);

      return {
        message: aiResponse,
        action,
        service: this.detectService(userMessage),
      };

    } catch (error) {
      console.error('AI Service error:', error);
      return this.generateBasicResponse(userId, userMessage, context);
    }
  }

  /**
   * Chama API OpenAI
   */
  private async callOpenAI(systemPrompt: string, conversation: AIMessage[]): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Rápido e econômico
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Chama API OnSpace AI
   */
  private async callOnSpaceAI(systemPrompt: string, conversation: AIMessage[]): Promise<string> {
    const response = await fetch('https://api.onspace.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OnSpace AI error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Constrói prompt do sistema com contexto do cliente
   */
  private buildSystemPrompt(
    profile: any,
    context: {
      signalStrength?: number;
      contractStatus?: string;
      lastIssue?: string;
    }
  ): string {
    return `Você é o FiberBot, assistente inteligente da FiberNet Telecom.

PERSONALIDADE:
- Sempre questionador e curioso
- Aprende hábitos do cliente
- Proativo em diagnosticar problemas
- Amigável mas profissional
- Usa linguagem clara e objetiva

CONTEXTO DO CLIENTE:
${profile.habits.length > 0 ? `- Hábitos conhecidos: ${profile.habits.join(', ')}` : '- Primeiro contato com este cliente'}
${profile.commonIssues.length > 0 ? `- Problemas comuns: ${profile.commonIssues.join(', ')}` : ''}
${profile.favoriteServices.length > 0 ? `- Serviços favoritos: ${profile.favoriteServices.join(', ')}` : ''}
- Horário de uso preferido: ${profile.preferredContactTime || 'Não informado'}

CONTEXTO TÉCNICO ATUAL:
- Sinal óptico: ${context.signalStrength ? context.signalStrength.toFixed(1) + ' dBm' : 'Não disponível'}
- Status do contrato: ${context.contractStatus || 'Ativo'}
${context.lastIssue ? `- Último problema: ${context.lastIssue}` : ''}

REGRAS DE DIAGNÓSTICO:
1. IPTV/Streaming travando:
   - SEMPRE pergunte qual serviço específico (Netflix, YouTube, IPTV)
   - Verifique o sinal óptico
   - Se sinal bom (> -25 dBm), pode ser problema do serviço
   - Sugira verificar no DownDetector
   - Se sinal ruim (< -25 dBm), sugira reinício da ONT

2. Internet lenta:
   - Pergunte qual dispositivo
   - Pergunte qual velocidade contratada
   - Sugira teste de velocidade
   - Verifique se há muitos dispositivos conectados

3. WiFi fraco:
   - Pergunte em qual cômodo
   - Sugira otimização de posição do roteador
   - Verifique dispositivos conectados

SEMPRE:
- Faça perguntas para entender melhor o problema
- Aprenda com cada interação
- Seja específico nas soluções
- Ofereça alternativas
- Evite respostas genéricas

NUNCA:
- Assuma que entendeu sem perguntar
- Dê soluções sem diagnóstico
- Ignore o histórico do cliente
- Seja impessoal`;
  }

  /**
   * Analisa conversa e aprende sobre o cliente
   */
  private async analyzeAndLearn(
    userId: string,
    userMessage: string,
    aiResponse: string,
    context: any
  ): Promise<void> {
    const lowerMessage = userMessage.toLowerCase();

    // Aprender hábitos
    if (lowerMessage.includes('sempre') || lowerMessage.includes('geralmente') || lowerMessage.includes('todo dia')) {
      const habit = userMessage;
      await customerProfileService.addHabit(userId, habit);
    }

    // Aprender problema comum
    if (lowerMessage.includes('problema') || lowerMessage.includes('travando') || lowerMessage.includes('lento')) {
      const issue = this.extractIssue(userMessage);
      if (issue) {
        await customerProfileService.addCommonIssue(userId, issue);
      }
    }

    // Aprender serviço favorito
    const service = this.detectService(userMessage);
    if (service) {
      await customerProfileService.addFavoriteService(userId, service);
    }

    // Aprender horário preferido
    const hour = new Date().getHours();
    await customerProfileService.updateContactTime(userId, `${hour}:00 - ${hour + 1}:00`);
  }

  /**
   * Detecta ação necessária
   */
  private detectAction(userMessage: string, aiResponse: string): AIResponse['action'] | undefined {
    const lowerMessage = userMessage.toLowerCase();
    const lowerResponse = aiResponse.toLowerCase();

    if (lowerMessage.includes('lento') || lowerMessage.includes('velocidade')) {
      return 'speedtest';
    }

    if (lowerMessage.includes('travando') || lowerMessage.includes('caindo')) {
      if (lowerResponse.includes('downdetector')) {
        return 'check_downdetector';
      }
      if (lowerResponse.includes('reiniciar') || lowerResponse.includes('reinício')) {
        return 'restart_ont';
      }
    }

    if (lowerMessage.includes('sinal') || lowerMessage.includes('conexão')) {
      return 'check_signal';
    }

    if (lowerMessage.includes('técnico') || lowerMessage.includes('chamado')) {
      return 'open_ticket';
    }

    return undefined;
  }

  /**
   * Detecta serviço mencionado
   */
  private detectService(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();
    
    const services = [
      'instagram',
      'whatsapp',
      'facebook',
      'netflix',
      'youtube',
      'tiktok',
      'twitter',
      'spotify',
      'iptv',
      'hbo',
      'disney',
      'prime video',
      'globoplay',
    ];

    for (const service of services) {
      if (lowerMessage.includes(service)) {
        return service;
      }
    }

    return undefined;
  }

  /**
   * Extrai problema da mensagem
   */
  private extractIssue(message: string): string | undefined {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('iptv')) return 'IPTV travando';
    if (lowerMessage.includes('netflix')) return 'Netflix com problema';
    if (lowerMessage.includes('youtube')) return 'YouTube travando';
    if (lowerMessage.includes('lento')) return 'Internet lenta';
    if (lowerMessage.includes('wifi')) return 'WiFi fraco';
    if (lowerMessage.includes('caindo')) return 'Conexão caindo';

    return undefined;
  }

  /**
   * Obtém histórico de conversa
   */
  private getConversationHistory(userId: string): AIMessage[] {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }

    const history = this.conversationHistory.get(userId)!;

    // Manter apenas últimas 10 mensagens para economizar tokens
    if (history.length > 20) {
      return history.slice(-20);
    }

    return history;
  }

  /**
   * Limpa histórico de conversa
   */
  clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  /**
   * Resposta básica (sem IA)
   */
  private generateBasicResponse(
    userId: string,
    userMessage: string,
    context: any
  ): AIResponse {
    const lowerMessage = userMessage.toLowerCase();

    // IPTV travando
    if (lowerMessage.includes('iptv') || lowerMessage.includes('tv') || lowerMessage.includes('stream')) {
      if (!context.signalStrength) {
        return {
          message: 'Qual serviço de streaming você está tentando usar? (Netflix, YouTube, IPTV, etc.)',
          action: 'check_signal',
        };
      }

      if (context.signalStrength < -25) {
        return {
          message: 'Detectei que seu sinal óptico está fraco. Isso pode estar causando travamento no streaming. Deseja reiniciar o equipamento?',
          action: 'restart_ont',
        };
      }

      return {
        message: 'Seu sinal óptico está bom. O problema pode ser do serviço. Qual serviço você está usando? Posso verificar se há instabilidade reportada no DownDetector.',
        action: 'check_downdetector',
      };
    }

    // Internet lenta
    if (lowerMessage.includes('lento') || lowerMessage.includes('velocidade')) {
      return {
        message: 'Vou fazer um teste de velocidade para você. Qual é o plano contratado?',
        action: 'speedtest',
      };
    }

    // Problema geral
    if (lowerMessage.includes('problema') || lowerMessage.includes('não funciona')) {
      return {
        message: 'Para eu te ajudar melhor, me conta: qual o problema específico que você está enfrentando? (Internet lenta, IPTV travando, WiFi fraco, etc.)',
      };
    }

    // Saudação
    if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia')) {
      return {
        message: 'Olá! Sou o FiberBot, seu assistente inteligente da FiberNet. Como posso te ajudar hoje?',
      };
    }

    // Padrão
    return {
      message: 'Entendi. Pode me contar mais detalhes sobre o que está acontecendo? Quanto mais informações você me der, melhor posso te ajudar! 😊',
    };
  }
}

export const aiService = new AIService();
