import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  const handleShare = () => {
    Alert.alert('Share Receipt', 'Receipt sharing is coming soon.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0D283B', '#05131F']} style={styles.background}>
        <View style={styles.container}>
          <View style={styles.badgeWrapper}>
            <LinearGradient colors={['#123C57', '#0A1F30']} style={styles.badgeInner}>
              <Ionicons name="checkmark" size={72} color={colors.text} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Payment Success!</Text>

          <View style={styles.receiptCard}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount</Text>
              <Text style={styles.receiptValue}>{amount ?? '0'} Ɡ</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>To</Text>
              <Text style={styles.receiptValue}>0x123456...7890</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>From</Text>
              <Text style={styles.receiptValue}>0xFEDCBA...6543</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Transaction Hash</Text>
              <Text style={styles.receiptValue}>0xa6f45acbd5...</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Gas Fee</Text>
              <Text style={styles.receiptValue}>0.001 Avax</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Date</Text>
              <Text style={styles.receiptValue}>06 Nov 2025</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Time</Text>
              <Text style={styles.receiptValue}>12:34</Text>
            </View>
          </View>
        </View>

        <View style={styles.footerButtons}>
          <TouchableOpacity
            style={[styles.footerButton, styles.primaryButton]}
            onPress={() => router.replace('/(tabs)/home' as never)}
            activeOpacity={0.85}
          >
            <Text style={styles.footerLabel}>Done</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.footerButton, styles.secondaryButton]}
            onPress={handleShare}
            activeOpacity={0.85}
          >
            <Text style={styles.footerLabel}>Share</Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  container: {
    alignItems: 'center',
  },
  badgeWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: 30,
    color: colors.text,
    fontFamily: 'serif',
    marginTop: 32,
  },
  receiptCard: {
    marginTop: 28,
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  receiptLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  receiptValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    backgroundColor: colors.cardOverlay,
    borderColor: colors.borderLight,
  },
  secondaryButton: {
    borderColor: colors.borderLight,
    backgroundColor: 'transparent',
  },
  footerLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

