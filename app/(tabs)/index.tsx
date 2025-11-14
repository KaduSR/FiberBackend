import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const connectionStatus = {
    speed: '500 Mbps',
    quality: 'Excelente',
    latency: '12ms',
    devices: 8,
  };



  const alerts = [
    {
      id: 1,
      type: 'info',
      title: 'Manutenção Programada',
      message: 'Amanhã às 02h em sua região. Duração estimada: 30min',
      icon: 'construct' as const,
    },
    {
      id: 2,
      type: 'success',
      title: 'Conexão Otimizada',
      message: 'FiberBot detectou e corrigiu latência alta automaticamente',
      icon: 'checkmark-circle' as const,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background.dark : theme.colors.background.light }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Olá, Cliente!</Text>
              <Text style={styles.planName}>Plano Fiber Game 500MB</Text>
            </View>

          </View>

          {/* Connection Status Card */}
          <View style={[styles.statusCard, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusTitleRow}>
                <Ionicons name="wifi" size={24} color={theme.colors.success} />
                <Text style={[styles.statusTitle, { color: theme.colors.text.primary.light }]}>
                  Conexão Ativa
                </Text>
              </View>
              <View style={[styles.qualityBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.qualityText}>{connectionStatus.quality}</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Ionicons name="speedometer" size={20} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text.primary.light }]}>
                  {connectionStatus.speed}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary.light }]}>
                  Velocidade
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="flash" size={20} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text.primary.light }]}>
                  {connectionStatus.latency}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary.light }]}>
                  Latência
                </Text>
              </View>
              
              <View style={styles.statItem}>
                <Ionicons name="phone-portrait" size={20} color={theme.colors.primary} />
                <Text style={[styles.statValue, { color: theme.colors.text.primary.light }]}>
                  {connectionStatus.devices}
                </Text>
                <Text style={[styles.statLabel, { color: theme.colors.text.secondary.light }]}>
                  Dispositivos
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Alerts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Avisos e Notificações
          </Text>
          
          {alerts.map((alert) => (
            <View
              key={alert.id}
              style={[styles.card, styles.alertCard, { 
                backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                ...theme.shadows.sm,
              }]}
            >
              <View style={[styles.alertIcon, { 
                backgroundColor: alert.type === 'success' 
                  ? `${theme.colors.success}20` 
                  : `${theme.colors.info}20` 
              }]}>
                <Ionicons 
                  name={alert.icon} 
                  size={24} 
                  color={alert.type === 'success' ? theme.colors.success : theme.colors.info} 
                />
              </View>
              <View style={styles.alertContent}>
                <Text style={[styles.alertTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {alert.title}
                </Text>
                <Text style={[styles.alertMessage, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  {alert.message}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Ações Rápidas
          </Text>
          
          <View style={styles.actionsGrid}>
            {[
              { icon: 'document-text', label: '2ª Via', color: theme.colors.primary },
              { icon: 'speedometer', label: 'Teste', color: theme.colors.success },
              { icon: 'headset', label: 'Suporte', color: theme.colors.warning },
              { icon: 'settings', label: 'Config', color: theme.colors.info },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { 
                  backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                  ...theme.shadows.sm,
                }]}
              >
                <View style={[styles.actionIconBg, { backgroundColor: `${action.color}20` }]}>
                  <Ionicons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginBottom: 4,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text.inverse,
  },

  statusCard: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  qualityText: {
    color: theme.colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },

  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: theme.spacing.md,
  },
  alertCard: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: (Dimensions.get('window').width - theme.spacing.md * 3 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
