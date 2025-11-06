import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useWDK } from '@/contexts/WDKContext';
import { useEffect, useState } from 'react';
import type { Wallet } from '@tetherio/wdk-types';

export default function WalletDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { wallets, client } = useWDK();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    const foundWallet = wallets.find((w) => w.id === id);
    setWallet(foundWallet || null);

    // Fetch wallet balance if client is available
    if (foundWallet && client) {
      fetchBalance(foundWallet.id);
    }
  }, [id, wallets, client]);

  const fetchBalance = async (walletId: string) => {
    if (!client) return;

    try {
      // Example: Get balance for the wallet
      // This is a placeholder - actual implementation depends on WDK client methods
      // const walletBalance = await client.getBalance(walletId);
      // setBalance(walletBalance.toString());
      setBalance('0.00');
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  if (!wallet) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Wallet not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Wallet Name</Text>
        <Text style={styles.value}>{wallet.name || 'Unnamed Wallet'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Wallet ID</Text>
        <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">
          {wallet.id}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Balance</Text>
        <Text style={styles.balance}>{balance || 'Loading...'}</Text>
      </View>

      {/* Add more wallet details and actions here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 20,
  },
});

