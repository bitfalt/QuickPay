import { useEffect, useMemo } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

const MOCK_TO = '0x1234567890ABCDEF1234';
const MOCK_FROM = '0xFEDCBA09876543211234';

export default function ReviewSendScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  useEffect(() => {
    if (!amount) {
      router.replace('/(tabs)/send' as never);
    }
  }, [amount, router]);

  const formattedAmount = useMemo(() => `${amount ?? '0'} Ɡ`, [amount]);

  const handleConfirm = () => {
    router.push({
      pathname: '/(tabs)/send/sending',
      params: {
        amount: amount ?? '0',
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0D283B', '#07121F']} style={styles.background}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityRole="button"
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={styles.title}>Review Send</Text>

          <View style={styles.amountCard}>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountRow}>
              <Text style={styles.amountSymbol}>Ɡ</Text>
              <Text style={styles.amountValue}>{formattedAmount}</Text>
            </View>
            <Text style={styles.amountSecondary}>≈ € {(Number(amount) * 20).toFixed(2)}</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Please confirm this transaction before sending</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>To</Text>
              <Text style={styles.summaryValue}>{MOCK_TO}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>From</Text>
              <Text style={styles.summaryValue}>{MOCK_FROM}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Network Fee</Text>
              <Text style={styles.summaryValue}>0.001 Avax</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.confirmButton} activeOpacity={0.85} onPress={handleConfirm}>
          <Text style={styles.confirmLabel}>Confirm</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    color: colors.text,
    fontFamily: 'serif',
    marginTop: 28,
  },
  amountCard: {
    marginTop: 32,
    backgroundColor: colors.cardOverlay,
    borderRadius: 22,
    padding: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  amountLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  amountSymbol: {
    fontSize: 32,
    color: colors.text,
  },
  amountValue: {
    fontSize: 32,
    color: colors.text,
    fontWeight: '700',
  },
  amountSecondary: {
    color: colors.textSecondary,
    marginTop: 12,
  },
  summaryCard: {
    marginTop: 24,
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 24,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  summaryTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 14,
    flexShrink: 1,
    textAlign: 'right',
  },
  confirmButton: {
    marginHorizontal: 28,
    marginBottom: 36,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: colors.cardOverlay,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  confirmLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

