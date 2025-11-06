import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

const sections = [
  {
    title: 'Account',
    items: [
      { label: 'Profile', icon: 'person-circle-outline' },
      { label: 'Security', icon: 'lock-closed-outline' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { label: 'Linked accounts', icon: 'card-outline' },
      { label: 'Notifications', icon: 'notifications-outline' },
    ],
  },
  {
    title: 'Support',
    items: [
      { label: 'Help center', icon: 'help-circle-outline' },
      { label: 'Contact us', icon: 'chatbubble-ellipses-outline' },
    ],
  },
];

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={['#05131F', '#0C2840']} style={styles.background}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your QuickPay preferences</Text>

          {sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item) => (
                <View key={item.label} style={styles.row}>
                  <View style={styles.iconBadge}>
                    <Ionicons name={item.icon as any} size={20} color={colors.text} />
                  </View>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
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
    paddingHorizontal: 24,
    paddingBottom: 120,
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    color: colors.text,
    fontFamily: 'serif',
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 8,
  },
  section: {
    marginTop: 32,
    backgroundColor: colors.cardOverlay,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
    paddingVertical: 12,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 16,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
});

