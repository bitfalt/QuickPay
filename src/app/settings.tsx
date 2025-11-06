import Header from '@/components/header';
import { clearAvatar } from '@/config/avatar-options';
import { networkConfigs } from '@/config/networks';
import useWalletAvatar from '@/hooks/use-wallet-avatar';
import getDisplaySymbol from '@/utils/get-display-symbol';
import { useWallet, WDKService, isWalletAvailable } from '@/lib/wdk-native';
import * as Clipboard from 'expo-clipboard';
import { useDebouncedNavigation } from '@/hooks/use-debounced-navigation';
import { Copy, Download, Info, Shield, Trash2, Wallet } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import { colors } from '@/constants/colors';
import { SeedPhrase } from '@/components/SeedPhrase';
import { fetchDeviceUniqueId } from '@/utils/device-info';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useDebouncedNavigation();
  const { wallet, clearWallet, addresses } = useWallet();
  const avatar = useWalletAvatar();
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string | null>(null);
  const [isLoadingSeed, setIsLoadingSeed] = useState(false);
  const walletFeaturesEnabled = isWalletAvailable && !!wallet;

  const handleDeleteWallet = () => {
    Alert.alert(
      'Delete Wallet',
      'This will permanently delete your wallet and all associated data. Make sure you have backed up your recovery phrase. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete Wallet',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWallet();
              await clearAvatar();
              toast.success('Wallet deleted successfully');
              router.dismissAll('/');
            } catch (error) {
              console.error('Failed to delete wallet:', error);
              toast.error('Failed to delete wallet');
            }
          },
        },
      ]
    );
  };

  const handleCopyAddress = async (address: string, networkName: string) => {
    await Clipboard.setStringAsync(address);
    toast.success(`${networkName} address copied to clipboard`);
  };

  const handleExportSeedPhrase = async () => {
    if (!walletFeaturesEnabled) {
      Alert.alert('Wallet unavailable', 'Wallet features are not available in this Expo Go build.');
      return;
    }

    Alert.alert(
      'Export Seed Phrase',
      'Warning: Your seed phrase gives full access to your wallet. Never share it with anyone. Anyone with your seed phrase can access your funds.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'I Understand',
          onPress: async () => {
            try {
              setIsLoadingSeed(true);
              const prf = await fetchDeviceUniqueId();
              if (
                !WDKService ||
                typeof (WDKService as { retrieveSeed?: (id: string) => Promise<string | null> })
                  .retrieveSeed !== 'function'
              ) {
                Alert.alert('Error', 'Wallet service unavailable');
                return;
              }

              const seed = await (
                WDKService as { retrieveSeed: (prf: string) => Promise<string | null> }
              ).retrieveSeed(prf);

              if (!seed) {
                Alert.alert('Error', 'Failed to retrieve seed phrase');
                return;
              }

              setSeedPhrase(seed);
              setShowSeedPhrase(true);
            } catch (error) {
              console.error('Failed to retrieve seed phrase:', error);
              Alert.alert('Error', 'Failed to retrieve seed phrase. Please try again.');
            } finally {
              setIsLoadingSeed(false);
            }
          },
        },
      ]
    );
  };

  const handleCopySeedPhrase = async () => {
    if (seedPhrase) {
      await Clipboard.setStringAsync(seedPhrase);
      toast.success('Seed phrase copied to clipboard');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return 'N/A';
    if (address.length <= 15) return address;
    return `${address.slice(0, 10)}...${address.slice(-10)}`;
  };

  const getNetworkName = (network: string) => {
    return networkConfigs[network]?.name || network;
  };

  if (!isWalletAvailable) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="Settings" />
        <View style={styles.disabledContent}>
          <Shield size={64} color={colors.primary} />
          <Text style={styles.disabledTitle}>Wallet Features Disabled</Text>
          <Text style={styles.disabledSubtitle}>
            Wallet functionality is not available in Expo Go. Install the QuickPay development
            client to manage your wallet.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="Settings" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Info Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wallet size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Wallet Information</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Icon</Text>
              <Text style={styles.infoValue}>{avatar}</Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Enabled Assets</Text>
              <Text style={styles.infoValue}>
                {wallet?.enabledAssets
                  ?.map((asset: string) => getDisplaySymbol(asset))
                  .join(', ') || 'None'}
              </Text>
            </View>
          </View>
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Security</Text>
          </View>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={handleExportSeedPhrase}
            disabled={isLoadingSeed || !walletFeaturesEnabled}
          >
            <Download size={20} color={colors.primary} />
            <Text style={styles.exportButtonText}>
              {isLoadingSeed ? 'Loading...' : 'Export Seed Phrase'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            Export your seed phrase to backup your wallet. Keep it safe and never share it with
            anyone.
          </Text>
        </View>

        {/* Network Addresses Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Network Addresses</Text>
          </View>

          <View style={styles.addressCard}>
            {addresses &&
              Object.entries(addresses).map(([network, address], index, array) => (
                <TouchableOpacity
                  key={network}
                  style={[
                    styles.addressRow,
                    index === array.length - 1 ? styles.addressRowLast : null,
                  ]}
                  onPress={() => handleCopyAddress(address as string, getNetworkName(network))}
                  activeOpacity={0.7}
                >
                  <View style={styles.addressContent}>
                    <Text style={styles.networkLabel}>{getNetworkName(network)}</Text>
                    <Text style={styles.addressValue}>{formatAddress(address as string)}</Text>
                  </View>
                  <Copy size={18} color={colors.primary} />
                </TouchableOpacity>
              ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>WDK Version</Text>
              <Text style={styles.infoValue}>Latest</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <View style={styles.sectionHeader}>
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>
          </View>

          <TouchableOpacity
            style={[styles.deleteButton, !walletFeaturesEnabled && styles.deleteButtonDisabled]}
            onPress={handleDeleteWallet}
            disabled={!walletFeaturesEnabled}
          >
            <Trash2 size={20} color={colors.white} />
            <Text style={styles.deleteButtonText}>Delete Wallet</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            Deleting your wallet will remove all data from this device. Make sure you have backed up
            your recovery phrase before proceeding.
          </Text>
        </View>
      </ScrollView>

      {/* Seed Phrase Modal */}
      <Modal
        visible={showSeedPhrase}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSeedPhrase(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Seed Phrase</Text>
            <TouchableOpacity onPress={() => setShowSeedPhrase(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalWarning}>
              ⚠️ Never share your seed phrase with anyone! Anyone with this phrase can access your
              wallet.
            </Text>

            {seedPhrase && (
              <View style={styles.seedPhraseContainer}>
                <SeedPhrase words={seedPhrase.split(' ')} editable={false} hidden={false} />
              </View>
            )}

            <TouchableOpacity style={styles.copyButton} onPress={handleCopySeedPhrase}>
              <Copy size={20} color={colors.primary} />
              <Text style={styles.copyButtonText}>Copy Seed Phrase</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  exportButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDark,
  },
  addressRowLast: {
    borderBottomWidth: 0,
  },
  addressContent: {
    flex: 1,
    marginRight: 12,
  },
  networkLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 13,
    color: colors.text,
    fontFamily: 'monospace',
  },
  dangerSection: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  dangerTitle: {
    color: colors.danger,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  deleteButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalClose: {
    fontSize: 16,
    color: colors.primary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalWarning: {
    fontSize: 14,
    color: colors.danger,
    marginBottom: 24,
    textAlign: 'center',
    padding: 16,
    backgroundColor: colors.dangerBackground,
    borderRadius: 12,
  },
  seedPhraseContainer: {
    marginBottom: 24,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
  },
  copyButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 24,
  },
  disabledTitle: {
    fontSize: 22,
    color: colors.text,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  disabledSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
});
