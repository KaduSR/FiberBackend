/**
 * Customer Profile Service
 * Serviço para armazenar e gerenciar o perfil e hábitos do cliente
 * 
 * Aprende:
 * - Horários preferidos de contato
 * - Serviços mais usados
 * - Problemas recorrentes
 * - Hábitos de uso
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CustomerProfile {
  userId: string;
  habits: string[]; // "Sempre assisto Netflix à noite", "Jogo online todo dia às 20h"
  commonIssues: string[]; // "IPTV travando", "WiFi fraco no quarto"
  favoriteServices: string[]; // "Netflix", "Instagram", "YouTube"
  preferredContactTime?: string; // "20:00 - 22:00"
  lastInteraction?: string; // ISO date
  interactions: number; // Contador de interações
}

class CustomerProfileService {
  private cacheKey = '@fibernet_customer_profile';

  /**
   * Obtém perfil do cliente
   */
  async getProfile(userId: string): Promise<CustomerProfile> {
    try {
      const stored = await AsyncStorage.getItem(`${this.cacheKey}_${userId}`);
      
      if (stored) {
        return JSON.parse(stored);
      }

      // Perfil novo
      return {
        userId,
        habits: [],
        commonIssues: [],
        favoriteServices: [],
        interactions: 0,
      };
    } catch (error) {
      console.error('Error getting customer profile:', error);
      return {
        userId,
        habits: [],
        commonIssues: [],
        favoriteServices: [],
        interactions: 0,
      };
    }
  }

  /**
   * Salva perfil do cliente
   */
  async saveProfile(profile: CustomerProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.cacheKey}_${profile.userId}`,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error('Error saving customer profile:', error);
    }
  }

  /**
   * Adiciona hábito ao perfil
   */
  async addHabit(userId: string, habit: string): Promise<void> {
    const profile = await this.getProfile(userId);

    // Evitar duplicatas
    if (!profile.habits.includes(habit)) {
      profile.habits.push(habit);

      // Manter apenas últimos 10 hábitos
      if (profile.habits.length > 10) {
        profile.habits = profile.habits.slice(-10);
      }

      await this.saveProfile(profile);
    }
  }

  /**
   * Adiciona problema comum ao perfil
   */
  async addCommonIssue(userId: string, issue: string): Promise<void> {
    const profile = await this.getProfile(userId);

    // Incrementar ou adicionar
    const existingIndex = profile.commonIssues.findIndex(i => i.includes(issue));
    
    if (existingIndex === -1) {
      profile.commonIssues.push(issue);
    }

    // Manter apenas últimos 5 problemas
    if (profile.commonIssues.length > 5) {
      profile.commonIssues = profile.commonIssues.slice(-5);
    }

    await this.saveProfile(profile);
  }

  /**
   * Adiciona serviço favorito ao perfil
   */
  async addFavoriteService(userId: string, service: string): Promise<void> {
    const profile = await this.getProfile(userId);

    // Normalizar nome
    const normalizedService = service.charAt(0).toUpperCase() + service.slice(1).toLowerCase();

    // Evitar duplicatas
    if (!profile.favoriteServices.includes(normalizedService)) {
      profile.favoriteServices.push(normalizedService);

      // Manter apenas 5 serviços favoritos
      if (profile.favoriteServices.length > 5) {
        profile.favoriteServices = profile.favoriteServices.slice(-5);
      }

      await this.saveProfile(profile);
    }
  }

  /**
   * Atualiza horário preferido de contato
   */
  async updateContactTime(userId: string, timeRange: string): Promise<void> {
    const profile = await this.getProfile(userId);
    profile.preferredContactTime = timeRange;
    await this.saveProfile(profile);
  }

  /**
   * Registra interação
   */
  async recordInteraction(userId: string): Promise<void> {
    const profile = await this.getProfile(userId);
    profile.interactions += 1;
    profile.lastInteraction = new Date().toISOString();
    await this.saveProfile(profile);
  }

  /**
   * Obtém resumo do perfil
   */
  async getProfileSummary(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);

    const parts: string[] = [];

    if (profile.interactions > 0) {
      parts.push(`${profile.interactions} interações anteriores`);
    }

    if (profile.favoriteServices.length > 0) {
      parts.push(`Usa principalmente: ${profile.favoriteServices.join(', ')}`);
    }

    if (profile.commonIssues.length > 0) {
      parts.push(`Problemas comuns: ${profile.commonIssues.join(', ')}`);
    }

    if (profile.preferredContactTime) {
      parts.push(`Prefere contato: ${profile.preferredContactTime}`);
    }

    return parts.length > 0 ? parts.join(' | ') : 'Cliente novo';
  }

  /**
   * Limpa perfil do cliente
   */
  async clearProfile(userId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.cacheKey}_${userId}`);
    } catch (error) {
      console.error('Error clearing customer profile:', error);
    }
  }
}

export const customerProfileService = new CustomerProfileService();
