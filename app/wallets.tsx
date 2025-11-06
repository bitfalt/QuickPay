import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWDK } from '@/contexts/WDKContext';
import { useState } from 'react';

export default function WalletsScreen() {
  const { wallets, isLoading, createWallet, deleteWallet } = useWDK();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWallet = async () => {
    Alert.prompt(
      'Create Wallet',
      'Enter a name for your wallet:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Create',
          onPress: async (name) => {
            if (!name || name.trim() === '') {
              Alert.alert('Error', 'Wallet name cannot be empty');
              return;
            }

            try {
              setIsCreating(true);
              const wallet = await createWallet(name.trim());
              router.push(`/wallet/${wallet.id}`);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create wallet');
            } finally {
              setIsCreating(false);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleDeleteWallet = (walletId: string, walletName: string) => {
    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete "${walletName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWallet(walletId);
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to delete wallet');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading wallets...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.createButton} onPress={handleCreateWallet} disabled={isCreating}>
        <Text style={styles.createButtonText}>
          {isCreating ? 'Creating...' : '+ Create New Wallet'}
        </Text>
      </TouchableOpacity>

      {wallets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No wallets yet</Text>
          <Text style={styles.emptySubtext}>Create your first wallet to get started</Text>
        </View>
      ) : (
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.walletItem}>
              <Link href={`/wallet/${item.id}`} style={styles.walletLink}>
                <View style={styles.walletInfo}>
                  <Text style={styles.walletName}>{item.name || 'Unnamed Wallet'}</Text>
                  <Text style={styles.walletId}>{item.id}</Text>
                </View>
              </Link>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteWallet(item.id, item.name || 'Unnamed Wallet')}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          style={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  createButton: {
    backgroundColor: '#f4511e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  walletLink: {
    flex: 1,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  walletId: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
});

