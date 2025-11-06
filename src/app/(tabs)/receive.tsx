import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

const WALLET_ADDRESS = '0x1234...ABCD';

export default function ReceiveScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#071A27', '#0E2D42']} style={styles.background}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/home' as never)}
            style={styles.circleButton}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.circleButton}
            accessibilityRole="button"
          >
            <Ionicons name="share-social-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>My QR</Text>
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <Svg width={220} height={220} viewBox="0 0 220 220">
              <Rect x={0} y={0} width={220} height={220} rx={18} fill={colors.white} />
              <Rect x={16} y={16} width={60} height={60} fill={colors.background} />
              <Rect x={28} y={28} width={36} height={36} fill={colors.white} />
              <Rect x={40} y={40} width={12} height={12} fill={colors.background} />

              <Rect x={220 - 76} y={16} width={60} height={60} fill={colors.background} />
              <Rect x={220 - 64} y={28} width={36} height={36} fill={colors.white} />
              <Rect x={220 - 52} y={40} width={12} height={12} fill={colors.background} />

              <Rect x={16} y={220 - 76} width={60} height={60} fill={colors.background} />
              <Rect x={28} y={220 - 64} width={36} height={36} fill={colors.white} />
              <Rect x={40} y={220 - 52} width={12} height={12} fill={colors.background} />

              <Rect x={104} y={36} width={18} height={18} fill={colors.background} />
              <Rect x={136} y={84} width={24} height={24} fill={colors.background} />
              <Rect x={104} y={120} width={20} height={20} fill={colors.background} />
              <Rect x={152} y={128} width={16} height={16} fill={colors.background} />
              <Rect x={88} y={164} width={28} height={28} fill={colors.background} />
              <Rect x={132} y={172} width={18} height={18} fill={colors.background} />
              <Rect x={168} y={168} width={24} height={24} fill={colors.background} />
              <Rect x={120} y={56} width={12} height={12} fill={colors.background} />
              <Rect x={160} y={52} width={12} height={12} fill={colors.background} />
              <Rect x={88} y={92} width={12} height={12} fill={colors.background} />
              <Rect x={60} y={128} width={12} height={12} fill={colors.background} />
              <Rect x={52} y={168} width={16} height={16} fill={colors.background} />
              <Rect x={124} y={148} width={12} height={12} fill={colors.background} />
            </Svg>
          </View>
          <Text style={styles.addressLabel}>Wallet</Text>
          <Text style={styles.addressValue}>{WALLET_ADDRESS}</Text>
        </View>

        <Text style={styles.helperText}>
          Use your unique QR Code to receive transfers from others
        </Text>
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
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 24,
    fontSize: 30,
    color: colors.text,
    fontFamily: 'serif',
  },
  qrCard: {
    marginTop: 32,
    width: '100%',
    borderRadius: 28,
    paddingVertical: 32,
    alignItems: 'center',
    backgroundColor: colors.cardOverlay,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    gap: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  addressLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  addressValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  helperText: {
    marginTop: 32,
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    width: '85%',
  },
});
