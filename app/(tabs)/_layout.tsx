import { Tabs } from 'expo-router';
import { ChartBar as BarChart2, Landmark, Receipt, CreditCard, Wallet, ChartPie as PieChart, CircleAlert as AlertCircle } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
          headerTitle: 'Dashboard Financeiro',
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Contas',
          tabBarIcon: ({ color, size }) => <Landmark size={size} color={color} />,
          headerTitle: 'Contas Bancárias',
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Despesas',
          tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
          headerTitle: 'Despesas',
        }}
      />
      <Tabs.Screen
        name="taxes"
        options={{
          title: 'Impostos',
          tabBarIcon: ({ color, size }) => <AlertCircle size={size} color={color} />,
          headerTitle: 'Gestão de Impostos',
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: 'Investir',
          tabBarIcon: ({ color, size }) => <BarChart2 size={size} color={color} />,
          headerTitle: 'Investimentos',
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transações',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
          headerTitle: 'Histórico de Transações',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 5,
    height: 60,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    marginBottom: 5,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.textPrimary,
  },
});