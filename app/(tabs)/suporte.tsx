import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { downDetectorService } from '@/services/downDetectorService';
import { aiService } from '@/services/aiService';
import { customerProfileService } from '@/services/customerProfileService';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface Ticket {
  id: number;
  title: string;
  status: 'aberto' | 'em_andamento' | 'resolvido';
  date: string;
  category: string;
}

export default function SuporteScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'chat' | 'tickets'>('chat');
  const [messageInput, setMessageInput] = useState('');
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Olá! Sou o FiberBot, seu assistente inteligente da FiberNet. 🤖',
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: 2,
      text: 'Estou aqui para te ajudar com qualquer problema na sua conexão! Eu aprendo seus hábitos e busco sempre entender melhor suas necessidades. 💡',
      isBot: true,
      timestamp: new Date(),
    },
    {
      id: 3,
      text: 'Me conte: o que está acontecendo? Está com problema em algum aplicativo específico? (Instagram, WhatsApp, Netflix, IPTV, YouTube, etc.)',
      isBot: true,
      timestamp: new Date(),
    },
  ]);

  // Load customer profile on mount
  React.useEffect(() => {
    if (user?.id_cliente) {
      loadCustomerProfile();
    }
  }, [user?.id_cliente]);

  const loadCustomerProfile = async () => {
    if (!user?.id_cliente) return;
    
    const summary = await customerProfileService.getProfileSummary(user.id_cliente);
    if (summary !== 'Cliente novo') {
      const welcomeMessage: Message = {
        id: messages.length + 1,
        text: `Olá novamente! 👋\n\nVi que você já falou comigo antes. ${summary}\n\nComo posso te ajudar hoje?`,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, welcomeMessage]);
    }
  };

  const [tickets] = useState<Ticket[]>([
    {
      id: 1,
      title: 'Lentidão na conexão',
      status: 'resolvido',
      date: '05/11/2025',
      category: 'Técnico',
    },
    {
      id: 2,
      title: 'Dúvida sobre fatura',
      status: 'em_andamento',
      date: '08/11/2025',
      category: 'Financeiro',
    },
  ]);

  const quickActions = [
    { id: 1, icon: 'speedometer', label: 'Lentidão', color: theme.colors.warning },
    { id: 2, icon: 'wifi-off', label: 'Sem Sinal', color: theme.colors.error },
    { id: 3, icon: 'document-text', label: 'Fatura', color: theme.colors.info },
    { id: 4, icon: 'help-circle', label: 'Dúvidas', color: theme.colors.primary },
  ];

  /**
   * Verifica status real do serviço usando DownDetector API
   */
  const checkServiceStatusReal = async (serviceName: string): Promise<string> => {
    try {
      setIsCheckingStatus(true);
      const status = await downDetectorService.checkServiceStatus(serviceName);
      return downDetectorService.formatStatusMessage(status);
    } catch (error) {
      console.error('Error checking service status:', error);
      return `Não foi possível verificar o status do ${serviceName} no momento. Por favor, acesse diretamente:\n\nhttps://downdetector.com.br/fora-do-ar/${serviceName}/`;
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const getBotResponse = async (userMessage: string): Promise<string> => {
    if (!user?.id_cliente) {
      return 'Por favor, faça login para continuar.';
    }

    try {
      setIsCheckingStatus(true);

      // Registrar interação
      await customerProfileService.recordInteraction(user.id_cliente);

      // Context para IA
      const context = {
        signalStrength: -18.5, // Mock - integrar com sinal real
        contractStatus: 'Ativo',
      };

      // Chamar serviço de IA
      const aiResponse = await aiService.generateResponse(
        user.id_cliente,
        userMessage,
        context
      );

      // Se detectou um serviço específico e precisa verificar DownDetector
      if (aiResponse.action === 'check_downdetector' && aiResponse.service) {
        const statusMessage = await checkServiceStatusReal(aiResponse.service);
        return `${aiResponse.message}\n\n${statusMessage}`;
      }

      // Se precisa analisar sinal para IPTV
      if (userMessage.toLowerCase().includes('iptv') || 
          userMessage.toLowerCase().includes('stream') ||
          userMessage.toLowerCase().includes('tv')) {
        
        const signalGood = context.signalStrength > -25;
        
        if (!aiResponse.service) {
          return `${aiResponse.message}\n\n📊 Análise de Sinal:\n📶 Sinal Óptico: ${context.signalStrength.toFixed(1)} dBm (${signalGood ? 'Excelente' : 'Ruim'})\n\n${signalGood ? '✅ Seu sinal está ótimo! O problema pode ser do serviço de streaming.\n\n❓ Qual serviço você está usando? (Netflix, YouTube, IPTV, etc.)' : '⚠️ Sinal fraco detectado! Recomendo reiniciar o equipamento.'}`;
        }
        
        if (signalGood) {
          // Sinal bom = problema do serviço
          const statusMessage = await checkServiceStatusReal(aiResponse.service);
          return `${aiResponse.message}\n\n📊 Análise de Sinal:\n📶 Sinal Óptico: ${context.signalStrength.toFixed(1)} dBm (Excelente)\n✅ Sua conexão FiberNet está perfeita!\n\n${statusMessage}`;
        } else {
          // Sinal ruim = problema da ONT
          return `${aiResponse.message}\n\n📊 Análise de Sinal:\n📶 Sinal Óptico: ${context.signalStrength.toFixed(1)} dBm (Ruim)\n⚠️ Detectei que seu sinal óptico está abaixo do ideal.\n\nℹ️ Isso pode estar causando travamento no ${aiResponse.service}.\n\n💡 Recomendação: Reinicie o equipamento na aba "Conexão" ou abra um chamado técnico.`;
        }
      }

      return aiResponse.message;

    } catch (error) {
      console.error('Error getting bot response:', error);
      return 'Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?';
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    if (messageInput.trim()) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: messageInput,
        isBot: false,
        timestamp: new Date(),
      };
      
      setMessages([...messages, newMessage]);
      const userText = messageInput;
      setMessageInput('');

      // Get bot response with real API integration
      const responseText = await getBotResponse(userText);
      
      const botResponse: Message = {
        id: messages.length + 2,
        text: responseText,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const handleQuickAction = async (label: string) => {
    let responseText = '';
    
    switch (label) {
      case 'Lentidão':
        responseText = 'Analisando sua conexão...\n\n✅ Velocidade: 500 Mbps (Normal)\n📊 Latência: 12ms (Excelente)\n📶 Sinal: Ótimo\n\n❓ O problema é em algum aplicativo específico?\n\nMe diga qual (Instagram, WhatsApp, Netflix, YouTube, etc.) e verifico no DownDetector se há instabilidade reportada em tempo real! 🔍';
        break;
      case 'Sem Sinal':
        responseText = 'Verificando seu sinal...\n\n📶 Sinal Óptico: -18 dBm (Ótimo)\n📡 Status: Conexão Ativa\n✅ Funcionamento Normal\n\n❓ O problema é em algum app ou serviço?\n\nMe informe qual (Instagram, WhatsApp, Netflix, etc.) que verifico no DownDetector em tempo real! 🔍';
        break;
      case 'Fatura':
        responseText = 'Para consultar sua fatura:\n\n💳 Acesse a aba "Perfil"\n📄 Visualize a 2ª via\n💰 Gere o código Pix para pagamento\n\nPrecisa de ajuda com algo mais?';
        break;
      case 'Dúvidas':
        responseText = '❓ Como posso te ajudar?\n\nSe está com problema em algum aplicativo ou serviço, me diga qual:\n\n• Instagram, WhatsApp, Facebook\n• Netflix, YouTube, Spotify\n• Bancos, Pix, E-commerce\n• Jogos, Discord, Twitch\n\nVou verificar no DownDetector em tempo real se há instabilidade! 🔍';
        break;
      default:
        responseText = `Vou te ajudar com "${label}". Analisando seus dados...`;
    }
    
    const botMessage: Message = {
      id: messages.length + 1,
      text: responseText,
      isBot: true,
      timestamp: new Date(),
    };
    setMessages([...messages, botMessage]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolvido': return theme.colors.success;
      case 'em_andamento': return theme.colors.warning;
      default: return theme.colors.info;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolvido': return 'Resolvido';
      case 'em_andamento': return 'Em Andamento';
      default: return 'Aberto';
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? theme.colors.background.dark : theme.colors.background.light }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <Text style={[styles.headerTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
          Suporte FiberNet
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
          Estamos aqui para ajudar
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: isDark ? theme.colors.surface.dark : theme.colors.surface.light }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          {activeTab === 'chat' ? (
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.tabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="chatbubbles" size={20} color={theme.colors.text.inverse} />
              <Text style={[styles.tabText, { color: theme.colors.text.inverse }]}>FiberBot</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabContent}>
              <Ionicons name="chatbubbles-outline" size={20} color={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light} />
              <Text style={[styles.tabText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                FiberBot
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          {activeTab === 'tickets' ? (
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.tabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="list" size={20} color={theme.colors.text.inverse} />
              <Text style={[styles.tabText, { color: theme.colors.text.inverse }]}>Chamados</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabContent}>
              <Ionicons name="list-outline" size={20} color={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light} />
              <Text style={[styles.tabText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                Chamados
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === 'chat' ? (
        <>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
              {quickActions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.quickActionButton, { 
                    backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                    ...theme.shadows.sm,
                  }]}
                  onPress={() => handleQuickAction(action.label)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Chat Messages */}
          <ScrollView 
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {isCheckingStatus && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Verificando status no DownDetector...
                </Text>
              </View>
            )}
            
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isBot ? styles.botMessage : styles.userMessage,
                ]}
              >
                {message.isBot && (
                  <View style={[styles.botAvatar, { backgroundColor: theme.colors.primary }]}>
                    <Ionicons name="chatbubbles" size={20} color={theme.colors.text.inverse} />
                  </View>
                )}
                <View
                  style={[
                    styles.messageContent,
                    message.isBot 
                      ? [{ backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light }, theme.shadows.sm]
                      : { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: message.isBot 
                        ? (isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light)
                        : theme.colors.text.inverse
                      },
                    ]}
                  >
                    {message.text}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Input Area */}
          <View style={[styles.inputContainer, { 
            backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
            borderTopColor: isDark ? theme.colors.border.dark : theme.colors.border.light,
          }]}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: isDark ? theme.colors.surface.dark : theme.colors.surface.light,
                color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light,
              }]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light}
              value={messageInput}
              onChangeText={setMessageInput}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: messageInput.trim() ? 1 : 0.5 }]}
              onPress={handleSendMessage}
              disabled={!messageInput.trim()}
            >
              <LinearGradient
                colors={theme.colors.gradient.primary}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="send" size={20} color={theme.colors.text.inverse} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <ScrollView 
          style={styles.ticketsContainer}
          contentContainerStyle={styles.ticketsContent}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity style={styles.newTicketButton}>
            <LinearGradient
              colors={theme.colors.gradient.primary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="add-circle" size={24} color={theme.colors.text.inverse} />
              <Text style={styles.buttonText}>Abrir Novo Chamado</Text>
            </LinearGradient>
          </TouchableOpacity>

          {tickets.map((ticket) => (
            <View
              key={ticket.id}
              style={[styles.ticketCard, { 
                backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                ...theme.shadows.sm,
              }]}
            >
              <View style={styles.ticketHeader}>
                <Text style={[styles.ticketTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {ticket.title}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(ticket.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
                    {getStatusText(ticket.status)}
                  </Text>
                </View>
              </View>
              
              <View style={styles.ticketInfo}>
                <View style={styles.ticketInfoItem}>
                  <Ionicons name="calendar" size={14} color={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light} />
                  <Text style={[styles.ticketInfoText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                    {ticket.date}
                  </Text>
                </View>
                <View style={styles.ticketInfoItem}>
                  <Ionicons name="pricetag" size={14} color={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light} />
                  <Text style={[styles.ticketInfoText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                    {ticket.category}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  tab: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  activeTab: {},
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    paddingVertical: theme.spacing.md,
  },
  quickActions: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  quickActionButton: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
    minWidth: 100,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  messageBubble: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  botMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    maxWidth: '100%',
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketsContainer: {
    flex: 1,
  },
  ticketsContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  newTicketButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  ticketCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketInfo: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  ticketInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ticketInfoText: {
    fontSize: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
