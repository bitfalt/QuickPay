import { DarkTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { ThemeProvider } from '@tetherto/wdk-uikit-react-native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import getChainsConfig from '@/config/get-chains-config';
import { Toaster } from 'sonner-native';
import { colors } from '@/constants/colors';
import { WalletProvider, WDKService, isWalletAvailable } from '@/lib/wdk-native';

SplashScreen.preventAutoHideAsync();

const shouldUseWalletProvider = Platform.OS !== 'web' && isWalletAvailable && !!WDKService;

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
  },
};

export default function RootLayout() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Only initialize WDK on native platforms (not web)
        const initialize = (WDKService as { initialize?: () => Promise<void> })?.initialize;
        if (shouldUseWalletProvider && initialize) {
          await initialize();
        }
      } catch (error) {
        console.error('Failed to initialize services in app layout:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };

    initApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        defaultMode="dark"
        brandConfig={{
          primaryColor: colors.primary,
        }}
      >
        {shouldUseWalletProvider ? (
          <WalletProvider
            config={{
              indexer: {
                apiKey: process.env.EXPO_PUBLIC_WDK_INDEXER_API_KEY!,
                url: process.env.EXPO_PUBLIC_WDK_INDEXER_BASE_URL!,
              },
              chains: getChainsConfig(),
              enableCaching: true,
            }}
          >
            <NavigationThemeProvider value={CustomDarkTheme}>
              <View style={{ flex: 1, backgroundColor: colors.background }}>
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.background },
                  }}
                />
                <StatusBar style="light" />
              </View>
            </NavigationThemeProvider>
          </WalletProvider>
        ) : (
          <NavigationThemeProvider value={CustomDarkTheme}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.background },
                }}
              />
              <StatusBar style="light" />
            </View>
          </NavigationThemeProvider>
        )}
        <Toaster
          offset={90}
          toastOptions={{
            style: {
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
            },
            titleStyle: { color: colors.text },
            descriptionStyle: { color: colors.text },
          }}
        />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
