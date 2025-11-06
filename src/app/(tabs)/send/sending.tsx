import { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function SendingScreen() {
  const router = useRouter();
  const { amount } = useLocalSearchParams<{ amount?: string }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({
        pathname: '/(tabs)/send/success',
        params: {
          amount: amount ?? '0',
        },
      } as never);
    }, 2200);

    return () => clearTimeout(timer);
  }, [amount, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#05131F', '#0D283B']} style={styles.background}>
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={styles.statusText}>Sending...</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  statusText: {
    color: colors.text,
    fontSize: 16,
    letterSpacing: 0.4,
  },
});

