import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';

export default function ScanScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#040E18', '#0B2436']} style={styles.background}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.circleButton}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.scannerFrame}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.iconCard} accessibilityRole="button">
            <Ionicons name="image-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCard} accessibilityRole="button">
            <MaterialCommunityIcons name="flashlight" size={26} color={colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Scan Code</Text>
        <Text style={styles.subtitle}>Point the camera at the QR Code to make a payment</Text>
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
    paddingTop: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  headerRow: {
    width: '100%',
    alignItems: 'flex-start',
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    width: '80%',
    aspectRatio: 1,
    marginTop: 80,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 48,
    height: 48,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.text,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.text,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 48,
    height: 48,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.text,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.text,
    borderBottomRightRadius: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 48,
  },
  iconCard: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 35, 55, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderLight,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontFamily: 'serif',
    marginTop: 48,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 22,
    width: '80%',
  },
});

