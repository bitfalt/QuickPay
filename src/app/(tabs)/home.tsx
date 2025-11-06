import { SafeAreaView, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';

const transactions = [
  { id: '1', title: 'Sent to Alice', date: 'Feb 12, 2025', amount: '€ 896,06' },
  { id: '2', title: 'Sent to Bob', date: 'Feb 11, 2025', amount: '€ 256,30' },
  { id: '3', title: 'Received from Nexo', date: 'Feb 10, 2025', amount: '€ 1.296,06' },
  { id: '4', title: 'Sent to Trinity', date: 'Feb 09, 2025', amount: '€ 56,06' },
];

const newsItems = [
  { id: '1', title: 'QuickPay launches instant transfers', tag: 'Product' },
  { id: '2', title: 'Merchants earn rewards with QuickPay', tag: 'Merchants' },
  { id: '3', title: 'Cross-border payouts now faster', tag: 'Updates' },
];

const chartWidth = Dimensions.get('window').width - 48;

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0D2C41', '#061523']} style={styles.headerCard}>
          <Text style={styles.brand}>QuickPay</Text>
          <View style={styles.currencyRow}>
            <View style={styles.currencyChip}>
              <Ionicons name="flag-outline" color={colors.text} size={16} />
              <Text style={styles.currencyText}>USD</Text>
            </View>
            <Ionicons name="swap-horizontal" size={18} color={colors.textSecondary} />
            <View style={styles.currencyChip}>
              <MaterialCommunityIcons name="currency-usd" color={colors.text} size={16} />
              <Text style={styles.currencyText}>CRC</Text>
            </View>
          </View>
          <Text style={styles.convertedText}>1 USD ≈ 502.373 CRC</Text>

          <LineChart
            data={{
              labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
              datasets: [{ data: [52, 61, 58, 66, 60, 72], color: () => colors.accent }],
            }}
            width={chartWidth}
            height={180}
            withInnerLines={false}
            withOuterLines={false}
            withShadow={false}
            chartConfig={{
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: () => colors.accent,
              labelColor: () => colors.textSecondary,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.backgroundAlt,
              },
            }}
            style={styles.chart}
            bezier
          />
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Latest Transactions</Text>
            <Text style={styles.sectionLink}>See all</Text>
          </View>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionIcon}>
                <Ionicons name="person-outline" size={20} color={colors.text} />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{tx.title}</Text>
                <Text style={styles.transactionDate}>{tx.date}</Text>
              </View>
              <Text style={styles.transactionAmount}>{tx.amount}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>News</Text>
            <Text style={styles.sectionLink}>See all</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newsRow}>
            {newsItems.map((item) => (
              <LinearGradient key={item.id} colors={['#12344A', '#091D2C']} style={styles.newsCard}>
                <Text style={styles.newsTag}>{item.tag}</Text>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsLink}>Read</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  headerCard: {
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 12,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  brand: {
    fontSize: 32,
    color: colors.text,
    fontFamily: 'serif',
    letterSpacing: 1.1,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 20,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  currencyText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  convertedText: {
    color: colors.textSecondary,
    marginTop: 18,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  chart: {
    marginTop: 18,
    borderRadius: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: colors.text,
    fontFamily: 'serif',
    letterSpacing: 0.6,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderMuted,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  transactionDate: {
    color: colors.textSecondary,
    marginTop: 4,
    fontSize: 12,
  },
  transactionAmount: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  newsRow: {
    gap: 16,
  },
  newsCard: {
    width: 210,
    borderRadius: 22,
    padding: 18,
    justifyContent: 'space-between',
  },
  newsTag: {
    color: colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  newsTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 24,
  },
  newsLink: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
});

