import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useWDK } from '@/contexts/WDKContext';

export default function HomeScreen() {
  const { isLoading, error, wallets } = useWDK();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Initializing WDK...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error.message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to QuickPay</Text>
      <Text style={styles.subtitle}>
        {wallets.length} wallet{wallets.length !== 1 ? 's' : ''} available
      </Text>
      
      <Link href="/wallets" style={styles.button}>
        <Text style={styles.buttonText}>Manage Wallets</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    textAlign: 'center',
  },
});

