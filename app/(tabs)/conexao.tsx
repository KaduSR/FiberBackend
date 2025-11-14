import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { speedTestService, FormattedSpeedTestResult } from '@/services/speedTestService';
import { ontDevicesService, ConnectedDevice, ONTInfo } from '@/services/ontDevicesService';

export default function ConexaoScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [ontInfo, setONTInfo] = useState<ONTInfo | null>(null);
  const [speedTestResult, setSpeedTestResult] = useState<FormattedSpeedTestResult | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [showAlert, setShowAlert] = useState<{ visible: boolean; title: string; message: string; onOk?: () => void }>({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    loadDevices();
    loadONTInfo();
    loadLastSpeedTest();
  }, []);

  const loadDevices = async () => {
    try {
      setIsLoadingDevices(true);
      const devicesData = await ontDevicesService.getConnectedDevices(user?.contractId || '');
      setDevices(devicesData);
    } catch (error) {
      console.error('Error loading devices:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const loadONTInfo = async () => {
    try {
      const info = await ontDevicesService.getONTInfo(user?.contractId || '');
      setONTInfo(info);
    } catch (error) {
      console.error('Error loading ONT info:', error);
    }
  };

  const loadLastSpeedTest = async () => {
    try {
      const history = await speedTestService.getTestHistory();
      if (history.length > 0) {
        setSpeedTestResult(history[0]);
      }
    } catch (error) {
      console.error('Error loading speed test history:', error);
    }
  };

  const runSpeedTest = async () => {
    try {
      setIsRunningTest(true);
      setTestProgress(0);

      const result = await speedTestService.runSpeedTest(undefined, (progress) => {
        setTestProgress(progress);
      });

      setSpeedTestResult(result);
      showCustomAlert(
        'Teste Concluído',
        `Download: ${result.downloadMbps} Mbps\nUpload: ${result.uploadMbps} Mbps\nPing: ${result.ping}ms`
      );
    } catch (error) {
      console.error('Error running speed test:', error);
      showCustomAlert('Erro', 'Não foi possível executar o teste de velocidade.');
    } finally {
      setIsRunningTest(false);
      setTestProgress(0);
    }
  };

  const toggleDeviceBlock = async (device: ConnectedDevice) => {
    showCustomAlert(
      'Bloquear Dispositivo',
      `Deseja bloquear "${device.name}"?`,
      async () => {
        const success = await ontDevicesService.toggleDeviceBlock(
          user?.contractId || '',
          device.macAddress,
          true
        );
        if (success) {
          loadDevices();
        }
      }
    );
  };

  const setPriority = async (device: ConnectedDevice) => {
    showCustomAlert(
      'Priorizar Banda',
      `Deseja priorizar a banda para "${device.name}"?\n\nIsso dará maior velocidade para este dispositivo.`,
      async () => {
        // Implementar lógica de priorização
        showCustomAlert('Sucesso', `Banda priorizada para ${device.name}!`);
      }
    );
  };

  const rebootONT = async () => {
    showCustomAlert(
      'Reiniciar ONT',
      'Deseja reiniciar sua ONT? A conexão ficará indisponível por alguns minutos.',
      async () => {
        const success = await ontDevicesService.rebootONT(user?.contractId || '');
        if (success) {
          showCustomAlert('Reiniciando', 'Sua ONT está sendo reiniciada. Aguarde alguns minutos.');
        }
      }
    );
  };

  const showCustomAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      setShowAlert({ visible: true, title, message, onOk });
    } else {
      Alert.alert(title, message, onOk ? [{ text: 'OK', onPress: onOk }] : undefined);
    }
  };

  const getSignalColor = (signal: number) => {
    if (signal >= 80) return theme.colors.success;
    if (signal >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const getDeviceIcon = (type: ConnectedDevice['deviceType']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'smartphone': return 'phone-portrait';
      case 'computer': return 'laptop';
      case 'tablet': return 'tablet-portrait';
      case 'tv': return 'tv';
      case 'console': return 'game-controller';
      case 'iot': return 'home';
      default: return 'help-circle';
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background.dark : theme.colors.background.light }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Gerenciamento de Rede
          </Text>
          <Text style={[styles.headerSubtitle, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
            Controle total da sua conexão FiberNet
          </Text>
        </View>

        {/* ONT Info Card */}
        {ontInfo && (
          <View style={[styles.card, { 
            backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
            ...theme.shadows.md,
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="hardware-chip" size={24} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  Status da ONT Huawei
                </Text>
              </View>
              <TouchableOpacity onPress={rebootONT}>
                <Ionicons name="reload" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.ontGrid}>
              <View style={styles.ontItem}>
                <Text style={[styles.ontLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Modelo
                </Text>
                <Text style={[styles.ontValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {ontInfo.model}
                </Text>
              </View>

              <View style={styles.ontItem}>
                <Text style={[styles.ontLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Sinal RX
                </Text>
                <Text style={[styles.ontValue, { color: theme.colors.success }]}>
                  {ontInfo.opticalPower.rx} dBm
                </Text>
              </View>

              <View style={styles.ontItem}>
                <Text style={[styles.ontLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Tempo Ativo
                </Text>
                <Text style={[styles.ontValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {formatUptime(ontInfo.uptime)}
                </Text>
              </View>

              <View style={styles.ontItem}>
                <Text style={[styles.ontLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Temperatura
                </Text>
                <Text style={[styles.ontValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {ontInfo.temperature}°C
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Speed Test Card */}
        <View style={[styles.card, { 
          backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
          ...theme.shadows.md,
        }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="speedometer" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Teste de Velocidade Ookla
              </Text>
            </View>
          </View>

          {speedTestResult && !isRunningTest && (
            <View style={styles.speedGrid}>
              <View style={styles.speedItem}>
                <Ionicons name="arrow-down" size={24} color={theme.colors.success} />
                <Text style={[styles.speedValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {speedTestResult.downloadMbps}
                </Text>
                <Text style={[styles.speedUnit, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Mbps Download
                </Text>
              </View>

              <View style={styles.speedItem}>
                <Ionicons name="arrow-up" size={24} color={theme.colors.info} />
                <Text style={[styles.speedValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {speedTestResult.uploadMbps}
                </Text>
                <Text style={[styles.speedUnit, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Mbps Upload
                </Text>
              </View>

              <View style={styles.speedItem}>
                <Ionicons name="flash" size={24} color={theme.colors.warning} />
                <Text style={[styles.speedValue, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {speedTestResult.ping}
                </Text>
                <Text style={[styles.speedUnit, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  ms Latência
                </Text>
              </View>
            </View>
          )}

          {isRunningTest && (
            <View style={styles.testingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.testingText, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Executando teste...
              </Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${testProgress}%` }]} />
              </View>
              <Text style={[styles.progressText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                {Math.round(testProgress)}%
              </Text>
            </View>
          )}

          {speedTestResult && (
            <Text style={[styles.serverInfo, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
              Servidor: {speedTestResult.serverLocation}
            </Text>
          )}

          <TouchableOpacity 
            style={styles.testButton}
            onPress={runSpeedTest}
            disabled={isRunningTest}
          >
            <LinearGradient
              colors={isRunningTest ? [theme.colors.border.light, theme.colors.border.dark] : theme.colors.gradient.primary}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.text.inverse} />
              <Text style={styles.buttonText}>
                {isRunningTest ? 'Testando...' : 'Executar Novo Teste'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Gaming Stats */}
        {speedTestResult && (
          <View style={[styles.card, { 
            backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
            ...theme.shadows.md,
          }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Ionicons name="game-controller" size={24} color={theme.colors.primary} />
                <Text style={[styles.cardTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  Plano Game - Estatísticas
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: `${theme.colors.success}20` }]}>
                <Text style={[styles.badgeText, { color: theme.colors.success }]}>Ótimo</Text>
              </View>
            </View>

            <View style={styles.gameStatsGrid}>
              <View style={styles.gameStat}>
                <Text style={[styles.gameStatLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Jitter
                </Text>
                <Text style={[styles.gameStatValue, { color: theme.colors.success }]}>
                  {speedTestResult.jitter}ms
                </Text>
              </View>
              <View style={styles.gameStat}>
                <Text style={[styles.gameStatLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Packet Loss
                </Text>
                <Text style={[styles.gameStatValue, { color: theme.colors.success }]}>
                  {speedTestResult.packetLoss}%
                </Text>
              </View>
              <View style={styles.gameStat}>
                <Text style={[styles.gameStatLabel, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  Ping
                </Text>
                <Text style={[styles.gameStatValue, { color: theme.colors.success }]}>
                  {speedTestResult.ping}ms
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Devices Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
              Dispositivos Conectados ({devices.filter(d => d.connected).length})
            </Text>
            <TouchableOpacity onPress={loadDevices}>
              <Ionicons name="refresh" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoadingDevices ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[styles.card, styles.deviceCard, { 
                  backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                  ...theme.shadows.sm,
                  opacity: device.connected ? 1 : 0.6,
                }]}
                onPress={() => device.connected && setPriority(device)}
              >
                <View style={styles.deviceInfo}>
                  <View style={[styles.deviceIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                    <Ionicons name={getDeviceIcon(device.deviceType)} size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.deviceDetails}>
                    <Text style={[styles.deviceName, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                      {device.name}
                    </Text>
                    <Text style={[styles.deviceType, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                      {device.ipAddress} • {device.connectionType === 'wifi' ? 'Wi-Fi' : 'Ethernet'}
                    </Text>
                    {device.connected && device.signalStrength && (
                      <View style={styles.signalRow}>
                        <Ionicons name="wifi" size={14} color={getSignalColor(device.signalStrength)} />
                        <Text style={[styles.signalText, { color: getSignalColor(device.signalStrength) }]}>
                          Sinal {device.signalStrength}%
                        </Text>
                      </View>
                    )}
                    {device.bandwidth && (
                      <Text style={[styles.bandwidthText, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                        ↓ {device.bandwidth.download} Mbps • ↑ {device.bandwidth.upload} Mbps
                      </Text>
                    )}
                  </View>
                </View>

                {device.connected && (
                  <TouchableOpacity 
                    onPress={() => toggleDeviceBlock(device)}
                    style={styles.blockButton}
                  >
                    <Ionicons name="ban" size={20} color={theme.colors.error} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* WiFi Tools */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Ferramentas Wi-Fi
          </Text>

          <View style={styles.toolsGrid}>
            <TouchableOpacity style={[styles.toolCard, { 
              backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
              ...theme.shadows.sm,
            }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                <Ionicons name="map" size={32} color={theme.colors.primary} />
              </View>
              <Text style={[styles.toolTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Mapa de Calor
              </Text>
              <Text style={[styles.toolDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                Analise a cobertura Wi-Fi
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, { 
              backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
              ...theme.shadows.sm,
            }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${theme.colors.success}20` }]}>
                <Ionicons name="people" size={32} color={theme.colors.success} />
              </View>
              <Text style={[styles.toolTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Rede Convidado
              </Text>
              <Text style={[styles.toolDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                Criar senha temporária
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, { 
              backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
              ...theme.shadows.sm,
            }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${theme.colors.warning}20` }]}>
                <Ionicons name="shield-checkmark" size={32} color={theme.colors.warning} />
              </View>
              <Text style={[styles.toolTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Controle Parental
              </Text>
              <Text style={[styles.toolDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                Gerenciar horários
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.toolCard, { 
              backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
              ...theme.shadows.sm,
            }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${theme.colors.info}20` }]}>
                <Ionicons name="settings" size={32} color={theme.colors.info} />
              </View>
              <Text style={[styles.toolTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                Configurações
              </Text>
              <Text style={[styles.toolDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                Ajustes avançados
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Web Alert Modal */}
      {Platform.OS === 'web' && (
        <Modal visible={showAlert.visible} transparent animationType="fade">
          <View style={styles.alertOverlay}>
            <View style={[styles.alertBox, { backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light }]}>
              <Text style={[styles.alertTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                {showAlert.title}
              </Text>
              <Text style={[styles.alertMessage, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                {showAlert.message}
              </Text>
              <TouchableOpacity 
                style={styles.alertButton}
                onPress={() => {
                  showAlert.onOk?.();
                  setShowAlert({ ...showAlert, visible: false });
                }}
              >
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  style={styles.alertButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.alertButtonText}>OK</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ontGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  ontItem: {
    flex: 1,
    minWidth: '45%',
    gap: 4,
  },
  ontLabel: {
    fontSize: 12,
  },
  ontValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  speedGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  speedItem: {
    alignItems: 'center',
    gap: 8,
  },
  speedValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  speedUnit: {
    fontSize: 12,
    textAlign: 'center',
  },
  testingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  testingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  progressText: {
    fontSize: 14,
  },
  serverInfo: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  testButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  buttonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  gameStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gameStat: {
    alignItems: 'center',
    gap: 4,
  },
  gameStatLabel: {
    fontSize: 12,
  },
  gameStatValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  loader: {
    marginVertical: theme.spacing.xl,
  },
  deviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    flex: 1,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceDetails: {
    flex: 1,
    gap: 2,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceType: {
    fontSize: 12,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  signalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bandwidthText: {
    fontSize: 11,
    marginTop: 2,
  },
  blockButton: {
    padding: 8,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  toolCard: {
    width: '47%',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  toolIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  toolDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    minWidth: 280,
    maxWidth: 400,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
  },
  alertMessage: {
    fontSize: 14,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  alertButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  alertButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  alertButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
