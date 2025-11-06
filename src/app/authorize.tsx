import { isWalletAvailable, useWallet } from '@/lib/wdk-native';
import { Fingerprint, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import getErrorMessage from '@/utils/get-error-message';

export default function AuthorizeScreen() {
  const insets = useSafeAreaInsets();
  const { wallet, unlockWallet } = useWallet();
  const walletSupported = isWalletAvailable;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletSupported) {
      setError(
        'Wallet functionality is unavailable in Expo Go. Please run the QuickPay dev client to access secure wallet features.'
      );
      return;
    }

    handleAuthorize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletSupported]);

  const handleAuthorize = async () => {
    if (!walletSupported) {
      Alert.alert(
        'Wallet unavailable',
        'Wallet functionality is not available in this Expo Go build. Please run a development client with BareKit enabled.'
      );
      return;
    }

    if (!wallet) {
      Alert.alert('Error', 'No wallet found. Please restart the app.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isDone = await unlockWallet();
      if (isDone) {
        // Wallet unlocked successfully - redirect will be handled by index.tsx
        // For now, just stay on this screen as main app UI will be built separately
        console.log('Wallet unlocked successfully');
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      setError(getErrorMessage(error, 'Failed to unlock wallet'));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    handleAuthorize();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Shield size={80} color={colors.primary} />
        </View>

        <Text style={styles.title}>Authorize Access</Text>
        <Text style={styles.subtitle}>Verify your identity to access your wallet</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Initializing wallet...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBiometricAuth}
              disabled={isLoading || !walletSupported}
            >
              <Fingerprint size={24} color={colors.white} />
              <Text style={styles.primaryButtonText}>
                {walletSupported ? 'Use Biometric' : 'Wallet Unavailable'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { marginBottom: insets.bottom + 20 }]}>
        <Text style={styles.footerText}>Your wallet is encrypted and secured with your device</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 50,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 14,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
  },
  primaryButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  errorContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.dangerBackground,
    borderRadius: 8,
    width: '100%',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
