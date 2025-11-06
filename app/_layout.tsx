import { Stack } from 'expo-router';
import { WDKProvider } from '@/contexts/WDKContext';
import 'react-native-url-polyfill/auto';

export default function RootLayout() {
  return (
    <WDKProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'QuickPay' }} />
        <Stack.Screen name="wallets" options={{ title: 'My Wallets' }} />
        <Stack.Screen name="wallet/[id]" options={{ title: 'Wallet Details' }} />
      </Stack>
    </WDKProvider>
  );
}

