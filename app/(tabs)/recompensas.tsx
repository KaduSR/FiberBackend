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

interface Reward {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  category: 'desconto' | 'upgrade' | 'parceiro';
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  unlocked: boolean;
  date?: string;
}

export default function RecompensasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const fiberPoints = 1580;
  const userLevel = 4;
  const nextLevelPoints = 2000;

  const rewards: Reward[] = [
    {
      id: 1,
      title: 'R$ 20 de Desconto',
      description: 'Desconto na próxima fatura',
      points: 500,
      icon: 'cash',
      color: theme.colors.success,
      category: 'desconto',
    },
    {
      id: 2,
      title: 'Upgrade 24h',
      description: '24h de upgrade para o plano superior',
      points: 800,
      icon: 'rocket',
      color: theme.colors.primary,
      category: 'upgrade',
    },
    {
      id: 3,
      title: 'R$ 50 de Desconto',
      description: 'Desconto na próxima fatura',
      points: 1200,
      icon: 'cash',
      color: theme.colors.success,
      category: 'desconto',
    },
    {
      id: 4,
      title: 'Upgrade 48h',
      description: '48h de upgrade para o plano superior',
      points: 1500,
      icon: 'rocket',
      color: theme.colors.primary,
      category: 'upgrade',
    },
    {
      id: 5,
      title: '15% OFF Eletrônicos',
      description: 'Cupom parceiro TechStore',
      points: 600,
      icon: 'phone-portrait',
      color: theme.colors.warning,
      category: 'parceiro',
    },
    {
      id: 6,
      title: 'Cinema 2x1',
      description: 'Ingresso 2x1 CineMax',
      points: 900,
      icon: 'film',
      color: theme.colors.info,
      category: 'parceiro',
    },
  ];

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Primeiro Passo',
      description: 'Primeiro pagamento via Pix',
      icon: 'checkmark-circle',
      unlocked: true,
      date: '01/10/2025',
    },
    {
      id: 2,
      title: 'Autodidata',
      description: 'Resolveu 5 problemas via FiberBot',
      icon: 'school',
      unlocked: true,
      date: '15/10/2025',
    },
    {
      id: 3,
      title: 'Embaixador',
      description: 'Indicou 3 novos clientes',
      icon: 'people',
      unlocked: true,
      date: '22/10/2025',
    },
    {
      id: 4,
      title: 'Mestre da Fibra',
      description: 'Alcançou nível 4',
      icon: 'trophy',
      unlocked: true,
      date: '05/11/2025',
    },
    {
      id: 5,
      title: 'Pagador VIP',
      description: '12 meses de pagamento em dia',
      icon: 'star',
      unlocked: false,
    },
    {
      id: 6,
      title: 'Influenciador',
      description: 'Indicou 10 novos clientes',
      icon: 'megaphone',
      unlocked: false,
    },
  ];

  const earnMethods = [
    { icon: 'card', label: 'Pague no Pix', points: '+50' },
    { icon: 'chatbubbles', label: 'Use o FiberBot', points: '+20' },
    { icon: 'person-add', label: 'Indique Amigos', points: '+200' },
    { icon: 'calendar', label: 'Pague em Dia', points: '+30' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background.dark : theme.colors.background.light }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Points */}
        <LinearGradient
          colors={theme.colors.gradient.primary}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.pointsDisplay}>
              <Ionicons name="star" size={48} color={theme.colors.warning} />
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsLabel}>Seus FiberPoints</Text>
                <Text style={styles.pointsValue}>{fiberPoints}</Text>
              </View>
            </View>

            <View style={styles.levelBadge}>
              <Ionicons name="trophy" size={24} color={theme.colors.warning} />
              <Text style={styles.levelText}>Nível {userLevel}</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progresso para Nível {userLevel + 1}</Text>
              <Text style={styles.progressPoints}>
                {fiberPoints} / {nextLevelPoints}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[theme.colors.warning, '#FFD700']}
                style={[styles.progressFill, { width: `${(fiberPoints / nextLevelPoints) * 100}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Earn Points Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Como Ganhar Pontos
          </Text>
          
          <View style={styles.earnGrid}>
            {earnMethods.map((method, index) => (
              <View
                key={index}
                style={[styles.earnCard, { 
                  backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                  ...theme.shadows.sm,
                }]}
              >
                <View style={[styles.earnIcon, { backgroundColor: `${theme.colors.primary}20` }]}>
                  <Ionicons name={method.icon as any} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.earnLabel, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {method.label}
                </Text>
                <Text style={[styles.earnPoints, { color: theme.colors.success }]}>
                  {method.points}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Rewards Store */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Loja de Vantagens
          </Text>

          {rewards.map((reward) => {
            const canAfford = fiberPoints >= reward.points;
            return (
              <View
                key={reward.id}
                style={[styles.card, styles.rewardCard, { 
                  backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                  ...theme.shadows.sm,
                  opacity: canAfford ? 1 : 0.6,
                }]}
              >
                <View style={styles.rewardInfo}>
                  <View style={[styles.rewardIcon, { backgroundColor: `${reward.color}20` }]}>
                    <Ionicons name={reward.icon} size={28} color={reward.color} />
                  </View>
                  <View style={styles.rewardDetails}>
                    <Text style={[styles.rewardTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                      {reward.title}
                    </Text>
                    <Text style={[styles.rewardDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                      {reward.description}
                    </Text>
                    <View style={styles.rewardPoints}>
                      <Ionicons name="star" size={16} color={theme.colors.warning} />
                      <Text style={[styles.rewardPointsText, { color: theme.colors.warning }]}>
                        {reward.points} pontos
                      </Text>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.redeemButton, { opacity: canAfford ? 1 : 0.5 }]}
                  disabled={!canAfford}
                >
                  <LinearGradient
                    colors={canAfford ? theme.colors.gradient.primary : [theme.colors.border.light, theme.colors.border.light]}
                    style={styles.redeemButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.redeemButtonText}>
                      {canAfford ? 'Resgatar' : 'Bloqueado'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
            Conquistas
          </Text>

          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[styles.achievementCard, { 
                  backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
                  ...theme.shadows.sm,
                  opacity: achievement.unlocked ? 1 : 0.5,
                }]}
              >
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.unlocked ? `${theme.colors.success}20` : `${theme.colors.border.light}30` }
                ]}>
                  <Ionicons 
                    name={achievement.icon} 
                    size={32} 
                    color={achievement.unlocked ? theme.colors.success : (isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light)} 
                  />
                </View>
                <Text style={[styles.achievementTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
                  {achievement.title}
                </Text>
                <Text style={[styles.achievementDescription, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
                  {achievement.description}
                </Text>
                {achievement.unlocked && achievement.date && (
                  <Text style={[styles.achievementDate, { color: theme.colors.success }]}>
                    {achievement.date}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width } = Dimensions.get('window');

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
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pointsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  pointsInfo: {
    gap: 4,
  },
  pointsLabel: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    opacity: 0.9,
  },
  pointsValue: {
    color: theme.colors.text.inverse,
    fontSize: 36,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  levelText: {
    color: theme.colors.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  progressSection: {
    gap: theme.spacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  progressPoints: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
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
  earnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  earnCard: {
    width: (width - theme.spacing.md * 3 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  earnIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  earnLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  earnPoints: {
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  rewardCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rewardInfo: {
    flexDirection: 'row',
    flex: 1,
    gap: theme.spacing.md,
  },
  rewardIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardDetails: {
    flex: 1,
    gap: 4,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  rewardDescription: {
    fontSize: 12,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  redeemButton: {
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  redeemButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  redeemButtonText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  achievementCard: {
    width: (width - theme.spacing.md * 3 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  achievementDate: {
    fontSize: 10,
    fontWeight: '600',
  },
});
