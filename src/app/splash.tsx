import { useEffect } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const splashLogo = require('../../assets/images/splash-logo.png');

export default function Splash() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(tabs)/home' as never);
    }, 2400);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <LinearGradient
          colors={['rgba(23, 52, 72, 0.35)', 'rgba(9, 23, 46, 0.2)']}
          style={styles.backgroundGlow}
        >
          <LinearGradient
            colors={['#6FB0D6', '#0A3A57']}
            start={{ x: 0.1, y: 0.1 }}
            end={{ x: 0.9, y: 0.9 }}
            style={styles.logoWrapper}
          >
            <Image source={splashLogo} style={styles.logo} resizeMode="contain" />
          </LinearGradient>
        </LinearGradient>
      </View>
      <Text style={styles.brand}>QuickPay</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1A24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGlow: {
    width: 260,
    height: 260,
    borderRadius: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  logo: {
    width: 140,
    height: 140,
    tintColor: '#F2F4F8',
  },
  brand: {
    fontSize: 24,
    letterSpacing: 1.2,
    color: '#F2F4F8',
    marginBottom: 48,
    fontFamily: 'serif',
  },
});
