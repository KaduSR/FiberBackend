import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  category: 'IPTV' | 'Fibra Óptica' | 'Gaming' | 'Tecnologia';
  image: string;
  url: string;
  date: string;
  source: string;
}

export default function NoticiasScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  const categories = ['Todas', 'IPTV', 'Fibra Óptica', 'Gaming', 'Tecnologia'];

  const newsArticles: NewsArticle[] = [
    {
      id: 1,
      title: 'Nova regulamentação sobre IPTV no Brasil',
      description: 'Anatel anuncia novas diretrizes para serviços de streaming e IPTV, impactando provedores e usuários.',
      category: 'IPTV',
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800',
      url: 'https://www.anatel.gov.br',
      date: '10/11/2025',
      source: 'Anatel',
    },
    {
      id: 2,
      title: 'Fibra óptica atinge 70% das cidades brasileiras',
      description: 'Expansão da infraestrutura de fibra óptica acelera, levando internet de alta velocidade para mais regiões.',
      category: 'Fibra Óptica',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
      url: 'https://www.teletime.com.br',
      date: '09/11/2025',
      source: 'Teletime',
    },
    {
      id: 3,
      title: 'Wi-Fi 7: A próxima revolução da conectividade',
      description: 'Novo padrão promete velocidades até 4x maiores e latência reduzida para gamers e streamers.',
      category: 'Gaming',
      image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800',
      url: 'https://www.tecmundo.com.br',
      date: '08/11/2025',
      source: 'TecMundo',
    },
    {
      id: 4,
      title: 'DownDetector: Como identificar instabilidades',
      description: 'Aprenda a usar o DownDetector para verificar se problemas em apps são da sua conexão ou do próprio serviço.',
      category: 'Tecnologia',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      url: 'https://downdetector.com.br',
      date: '07/11/2025',
      source: 'DownDetector',
    },
    {
      id: 5,
      title: 'Serviços de IPTV pirata sob fiscalização',
      description: 'Operação nacional combate IPTV ilegal, provedores alertam sobre riscos de serviços não autorizados.',
      category: 'IPTV',
      image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
      url: 'https://www.gov.br',
      date: '06/11/2025',
      source: 'Gov.br',
    },
    {
      id: 6,
      title: 'Latência ultra-baixa: O futuro do gaming online',
      description: 'Novas tecnologias de fibra óptica prometem latência abaixo de 5ms, revolucionando jogos competitivos.',
      category: 'Gaming',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
      url: 'https://www.theenemy.com.br',
      date: '05/11/2025',
      source: 'The Enemy',
    },
  ];

  const filteredNews = selectedCategory === 'Todas' 
    ? newsArticles 
    : newsArticles.filter(article => article.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'IPTV': return theme.colors.error;
      case 'Fibra Óptica': return theme.colors.primary;
      case 'Gaming': return theme.colors.success;
      case 'Tecnologia': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const handleOpenArticle = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Erro ao abrir link:', err));
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? theme.colors.background.dark : theme.colors.background.light }]}>
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
        <Text style={[styles.headerTitle, { color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light }]}>
          Notícias Tech
        </Text>
        <Text style={[styles.headerSubtitle, { color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light }]}>
          Fique por dentro das novidades
        </Text>
      </View>

      {/* Category Filter */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categories}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
            >
              {selectedCategory === category ? (
                <LinearGradient
                  colors={theme.colors.gradient.primary}
                  style={styles.categoryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.categoryTextActive}>{category}</Text>
                </LinearGradient>
              ) : (
                <View style={[styles.categoryButton, { 
                  backgroundColor: isDark ? theme.colors.surface.dark : theme.colors.surface.light 
                }]}>
                  <Text style={[styles.categoryText, { 
                    color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light 
                  }]}>
                    {category}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News Articles */}
      <ScrollView 
        style={styles.newsContainer}
        contentContainerStyle={styles.newsContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNews.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[styles.newsCard, { 
              backgroundColor: isDark ? theme.colors.card.dark : theme.colors.card.light,
              ...theme.shadows.md,
            }]}
            onPress={() => handleOpenArticle(article.url)}
          >
            <Image 
              source={{ uri: article.image }} 
              style={styles.newsImage}
              resizeMode="cover"
            />
            
            <View style={styles.newsContent}>
              <View style={styles.newsHeader}>
                <View style={[styles.categoryBadge, { 
                  backgroundColor: `${getCategoryColor(article.category)}20` 
                }]}>
                  <Text style={[styles.categoryBadgeText, { 
                    color: getCategoryColor(article.category) 
                  }]}>
                    {article.category}
                  </Text>
                </View>
                
                <View style={styles.newsMetadata}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={12} 
                    color={isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light} 
                  />
                  <Text style={[styles.newsDate, { 
                    color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light 
                  }]}>
                    {article.date}
                  </Text>
                </View>
              </View>

              <Text style={[styles.newsTitle, { 
                color: isDark ? theme.colors.text.primary.dark : theme.colors.text.primary.light 
              }]}>
                {article.title}
              </Text>

              <Text style={[styles.newsDescription, { 
                color: isDark ? theme.colors.text.secondary.dark : theme.colors.text.secondary.light 
              }]}>
                {article.description}
              </Text>

              <View style={styles.newsFooter}>
                <View style={styles.sourceContainer}>
                  <Ionicons 
                    name="newspaper-outline" 
                    size={14} 
                    color={theme.colors.primary} 
                  />
                  <Text style={[styles.sourceText, { color: theme.colors.primary }]}>
                    {article.source}
                  </Text>
                </View>

                <View style={styles.readMoreContainer}>
                  <Text style={[styles.readMoreText, { color: theme.colors.primary }]}>
                    Ler mais
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
  categoriesContainer: {
    paddingVertical: theme.spacing.sm,
  },
  categories: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  newsContainer: {
    flex: 1,
  },
  newsContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  newsCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  newsMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newsDate: {
    fontSize: 12,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  newsDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  readMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
