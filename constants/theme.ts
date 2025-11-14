export const theme = {
  colors: {
    primary: '#0066CC',
    primaryDark: '#004C99',
    primaryLight: '#0080FF',
    
    background: {
      light: '#FFFFFF',
      dark: '#0A0A0A',
    },
    
    surface: {
      light: '#F8F9FA',
      dark: '#1A1A1A',
    },
    
    card: {
      light: '#FFFFFF',
      dark: '#1E1E1E',
    },
    
    text: {
      primary: {
        light: '#1A1A1A',
        dark: '#F5F5F5',
      },
      secondary: {
        light: '#6B7280',
        dark: '#9CA3AF',
      },
      inverse: '#FFFFFF',
    },
    
    border: {
      light: '#E5E7EB',
      dark: '#374151',
    },
    
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    gradient: {
      primary: ['#0080FF', '#0066CC'],
      dark: ['#1A1A1A', '#0A0A0A'],
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
