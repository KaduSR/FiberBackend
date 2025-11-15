import { AuthProvider } from '@/contexts/AuthContext'; // <--- O Provider
import { useAuth } from '@/hooks/useAuth';           // <--- O Hook
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

/**
 * Este é o componente que gere a navegação
 * (Obrigatório estar separado para poder aceder ao 'useAuth')
 */
function RootLayoutNav() {
  const { user, isLoading } = useAuth(); // Pega o estado do utilizador
  const router = useRouter();

  // --- ESTE É O BLOCO DE LÓGICA DE REDIRECIONAMENTO ---
  useEffect(() => {
    // Se ainda estiver a carregar, não faças nada
    if (isLoading) return;

    if (!user) {
      // Se o utilizador for NULO (logout), força o redirecionamento
      // para a tela de login.
      router.replace('/login');
    } else {
      // Se o utilizador EXISTIR (login), força o redirecionamento
      // para a tela principal (tabs).
      router.replace('/(tabs)');
    }

  }, [user, isLoading]); // <- "Ouve" as mudanças nestas duas variáveis
  // --- FIM DO BLOCO DE LÓGICA ---


  // Este Stack gere as duas telas (Login e Tabs)
  // O 'useEffect' acima trata de alternar entre elas.
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
