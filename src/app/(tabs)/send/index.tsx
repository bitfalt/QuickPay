import { useMemo, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

const keypadRows: Array<Array<string>> = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', '00', 'back'],
];

export default function SendAmountScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const formattedAmount = useMemo(() => (amount ? `${amount} Ɡ` : 'Ɡ'), [amount]);

  const handleKeyPress = (value: string) => {
    setAmount((prev) => {
      if (prev.length >= 10) return prev;
      if (value === '00') {
        return prev ? `${prev}00` : prev;
      }
      return prev + value;
    });
  };

  const handleBackspace = () => {
    setAmount((prev) => prev.slice(0, -1));
  };

  const handleContinue = () => {
    if (!amount) {
      return;
    }
    router.push({
      pathname: '/(tabs)/send/review',
      params: {
        amount,
      },
    } as never);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#0D283B', '#041019']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.container} overScrollMode="never">
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => router.navigate('/(tabs)/home' as never)}
              accessibilityRole="button"
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/send/scan' as never)}
              accessibilityRole="button"
              style={styles.scanButton}
            >
              <Ionicons name="qr-code-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Enter amount</Text>
          <View style={styles.amountWrapper}>
            <Text style={styles.symbol}>Ɡ</Text>
            <View style={styles.amountLine} />
            <Text style={styles.amountValue}>{formattedAmount}</Text>
          </View>
          <Text style={styles.rateText}>1 Avax ≈ €20</Text>

          <View style={styles.keypad}>
            {keypadRows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((value) => {
                  const isBack = value === 'back';
                  return (
                    <TouchableOpacity
                      key={value}
                      style={styles.keypadButton}
                      onPress={isBack ? handleBackspace : () => handleKeyPress(value)}
                      activeOpacity={0.75}
                    >
                      <LinearGradient colors={['#0D2C43', '#061D2B']} style={styles.keypadGradient}>
                        {isBack ? (
                          <Ionicons name="backspace-outline" size={22} color={colors.text} />
                        ) : (
                          <Text style={styles.keypadText}>{value}</Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.continueButton, !amount && styles.continueButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleContinue}
        >
          <Text style={styles.continueLabel}>Continue to pay</Text>
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
    paddingHorizontal: 32,
    paddingBottom: 140,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scanButton: {
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
  amountWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 32,
  },
  symbol: {
    fontSize: 36,
    color: colors.text,
  },
  amountLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  amountValue: {
    fontSize: 28,
    color: colors.text,
    fontWeight: '600',
  },
  rateText: {
    color: colors.textSecondary,
    marginTop: 12,
    letterSpacing: 0.3,
  },
  keypad: {
    marginTop: 48,
    gap: 22,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  keypadButton: {
    width: '30%',
    aspectRatio: 1,
  },
  keypadGradient: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: StyleSheet.hairlineWidth,
  },
  keypadText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    left: 32,
    right: 32,
    bottom: 36,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: colors.cardOverlay,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});

