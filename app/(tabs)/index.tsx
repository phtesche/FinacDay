import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { ArrowUpRight, TrendingUp, TrendingDown, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { formatCurrency } from '@/utils/formatters';
import { useAccountsStore } from '@/stores/accountsStore';
import { useExpensesStore } from '@/stores/expensesStore';
import { useTaxesStore } from '@/stores/taxesStore';
import { useInvestmentsStore } from '@/stores/investmentsStore';
import { Card } from '@/components/Card';
import { AlertCard } from '@/components/AlertCard';

export default function Dashboard() {
  const router = useRouter();
  const { accounts, getTotalBalance } = useAccountsStore();
  const { expenses, getPendingExpenses, getTotalExpenses } = useExpensesStore();
  const { taxes, getUpcomingTaxes } = useTaxesStore();
  const { investments, getTotalInvestments } = useInvestmentsStore();
  const [screenWidth, setScreenWidth] = useState(Platform.OS === 'web' ? 350 : 300);

  const totalBalance = getTotalBalance();
  const totalExpenses = getTotalExpenses();
  const totalInvestments = getTotalInvestments();
  const pendingExpenses = getPendingExpenses();
  const upcomingTaxes = getUpcomingTaxes();

  // Mock data for the chart
  const chartData = [
    {
      name: 'Expenses',
      value: totalExpenses,
      color: colors.chartColors[1],
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: 'Investments',
      value: totalInvestments,
      color: colors.chartColors[2],
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    },
    {
      name: 'Available',
      value: Math.max(totalBalance - totalExpenses - totalInvestments, 0),
      color: colors.chartColors[0],
      legendFontColor: colors.textPrimary,
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    propsForLabels: {
      fontFamily: 'Inter-Regular',
    },
  };

  // Navigate to specific sections
  const navigateToSection = (section: string) => {
    router.push(`/(tabs)/${section}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.summarySection}>
        <Card style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.accountsInfo}>
            <Text style={styles.accountsText}>{accounts.length} accounts</Text>
            <TouchableOpacity 
              style={styles.viewAll} 
              onPress={() => navigateToSection('accounts')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <ArrowUpRight size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.quickStats}>
          <Card style={styles.statCard} onPress={() => navigateToSection('expenses')}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Expenses</Text>
              <TrendingUp size={20} color={colors.error} />
            </View>
            <Text style={styles.statAmount}>{formatCurrency(totalExpenses)}</Text>
            <Text style={styles.statSubtext}>
              {pendingExpenses.length} pending
            </Text>
          </Card>
          
          <Card style={styles.statCard} onPress={() => navigateToSection('investments')}>
            <View style={styles.statHeader}>
              <Text style={styles.statTitle}>Investments</Text>
              <TrendingDown size={20} color={colors.accent} />
            </View>
            <Text style={styles.statAmount}>{formatCurrency(totalInvestments)}</Text>
            <Text style={styles.statSubtext}>
              {investments.length} active
            </Text>
          </Card>
        </View>
      </View>

      {(pendingExpenses.length > 0 || upcomingTaxes.length > 0) && (
        <View style={styles.alertsSection}>
          <Text style={styles.sectionTitle}>Alerts</Text>
          {pendingExpenses.length > 0 && (
            <AlertCard 
              title="Pending Expenses" 
              description={`You have ${pendingExpenses.length} unpaid expenses`}
              icon={<AlertTriangle size={24} color={colors.warning} />}
              onPress={() => navigateToSection('expenses')}
              type="warning"
            />
          )}
          
          {upcomingTaxes.length > 0 && (
            <AlertCard 
              title="Upcoming Taxes" 
              description={`You have ${upcomingTaxes.length} taxes due soon`}
              icon={<AlertTriangle size={24} color={colors.error} />}
              onPress={() => navigateToSection('taxes')}
              type="error"
            />
          )}
        </View>
      )}

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <Card style={styles.chartCard}>
          <PieChart
            data={chartData}
            width={screenWidth}
            height={200}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute={false}
          />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  summarySection: {
    marginBottom: 24,
  },
  balanceCard: {
    padding: 20,
    marginBottom: 16,
  },
  balanceLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  accountsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewAll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.primary,
    marginRight: 4,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: colors.textSecondary,
  },
  statAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textSecondary,
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartCard: {
    padding: 16,
    alignItems: 'center',
  },
});