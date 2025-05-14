import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Trash2, CreditCard as Edit, Plus, TrendingUp } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useInvestmentsStore } from '@/stores/investmentsStore';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { KeyboardAwareScrollView } from '@/components/KeyboardAwareScrollView';
import { Picker } from '@/components/Picker';
import { BarChart } from 'react-native-chart-kit';

const INVESTMENT_CATEGORIES = [
  { label: 'Stocks', value: 'stocks' },
  { label: 'Bonds', value: 'bonds' },
  { label: 'Real Estate', value: 'real_estate' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'ETF', value: 'etf' },
  { label: 'Retirement', value: 'retirement' },
  { label: 'Other', value: 'other' },
];

export default function InvestmentsScreen() {
  const { investments, addInvestment, updateInvestment, deleteInvestment, getTotalInvestments } = useInvestmentsStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentInvestment, setCurrentInvestment] = useState<any>(null);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(INVESTMENT_CATEGORIES[0].value);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalInvestments = getTotalInvestments();

  // Calculate totals by category for chart
  const categoryTotals = INVESTMENT_CATEGORIES.map(cat => {
    const total = investments
      .filter(inv => inv.category === cat.value)
      .reduce((sum, inv) => sum + inv.amount, 0);
    return {
      category: cat.label,
      amount: total,
    };
  }).filter(item => item.amount > 0);

  // Sort by amount, descending
  categoryTotals.sort((a, b) => b.amount - a.amount);

  // Chart data
  const chartData = {
    labels: categoryTotals.map(cat => cat.category),
    datasets: [
      {
        data: categoryTotals.map(cat => cat.amount),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.textPrimary,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: colors.primary,
    },
    barPercentage: 0.5,
  };

  const openAddModal = () => {
    setCurrentInvestment(null);
    setName('');
    setAmount('');
    setDate(formatDate(new Date(), 'yyyy-MM-dd'));
    setCategory(INVESTMENT_CATEGORIES[0].value);
    setNotes('');
    setErrors({});
    setIsModalVisible(true);
  };

  const openEditModal = (investment: any) => {
    setCurrentInvestment(investment);
    setName(investment.name);
    setAmount(investment.amount.toString());
    setDate(investment.date);
    setCategory(investment.category);
    setNotes(investment.notes || '');
    setErrors({});
    setIsModalVisible(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = 'Investment name is required';
    }
    
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!date.trim()) {
      newErrors.date = 'Date is required';
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Date must be in YYYY-MM-DD format';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    const investmentData = {
      name,
      amount: parseFloat(amount),
      date,
      category,
      notes,
    };
    
    if (currentInvestment) {
      updateInvestment(currentInvestment.id, investmentData);
    } else {
      addInvestment(investmentData);
    }
    
    setIsModalVisible(false);
  };

  const handleDeleteInvestment = (id: string) => {
    deleteInvestment(id);
  };

  const getCategoryLabel = (value: string) => {
    const category = INVESTMENT_CATEGORIES.find(cat => cat.value === value);
    return category ? category.label : 'Other';
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Total Investments</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalInvestments)}</Text>
          <Text style={styles.summarySubtitle}>{investments.length} Investment{investments.length !== 1 ? 's' : ''}</Text>
        </Card>

        {investments.length > 0 && (
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Investment Breakdown</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <BarChart
                data={chartData}
                width={Math.max(350, categoryTotals.length * 80)}
                height={220}
                chartConfig={chartConfig}
                verticalLabelRotation={30}
                fromZero
                showValuesOnTopOfBars
                style={{ transformOrigin: 'center' }}
              />
            </ScrollView>
          </Card>
        )}

        <View style={styles.investmentsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Investments</Text>
            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {investments.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No investments yet. Add your first investment to get started.</Text>
            </Card>
          ) : (
            INVESTMENT_CATEGORIES.map(categoryItem => {
              const categoryInvestments = investments.filter(
                inv => inv.category === categoryItem.value
              );
              
              if (categoryInvestments.length === 0) return null;
              
              const categoryTotal = categoryInvestments.reduce(
                (sum, inv) => sum + inv.amount, 0
              );
              
              return (
                <View key={categoryItem.value} style={styles.categoryGroup}>
                  <Text style={styles.categoryTitle}>
                    {categoryItem.label} - {formatCurrency(categoryTotal)}
                  </Text>
                  
                  {categoryInvestments.map(investment => (
                    <Card key={investment.id} style={styles.investmentCard}>
                      <View style={styles.investmentHeader}>
                        <View>
                          <Text style={styles.investmentName}>{investment.name}</Text>
                          <Text style={styles.investmentDate}>Added: {investment.date}</Text>
                        </View>
                        <View style={styles.investmentAmountContainer}>
                          <TrendingUp size={16} color={colors.accent} style={styles.trendingIcon} />
                          <Text style={styles.investmentAmount}>{formatCurrency(investment.amount)}</Text>
                        </View>
                      </View>
                      {investment.notes && (
                        <Text style={styles.investmentNotes}>{investment.notes}</Text>
                      )}
                      <View style={styles.investmentActions}>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => openEditModal(investment)}
                        >
                          <Edit size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDeleteInvestment(investment.id)}
                        >
                          <Trash2 size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </Card>
                  ))}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <KeyboardAwareScrollView>
              <Text style={styles.modalTitle}>
                {currentInvestment ? 'Edit Investment' : 'Add New Investment'}
              </Text>
              
              <FormField
                label="Investment Name"
                error={errors.name}
              >
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter investment name"
                />
              </FormField>
              
              <FormField
                label="Amount"
                error={errors.amount}
              >
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </FormField>
              
              <FormField
                label="Date (YYYY-MM-DD)"
                error={errors.date}
              >
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                />
              </FormField>
              
              <FormField label="Category">
                <Picker
                  selectedValue={category}
                  onValueChange={(value) => setCategory(value)}
                  items={INVESTMENT_CATEGORIES}
                />
              </FormField>
              
              <FormField label="Notes (Optional)">
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Enter any additional notes"
                  multiline
                  numberOfLines={4}
                />
              </FormField>
              
              <View style={styles.modalActions}>
                <Button 
                  title="Cancel" 
                  onPress={() => setIsModalVisible(false)} 
                  type="secondary"
                  style={styles.modalButton}
                />
                <Button 
                  title="Save" 
                  onPress={handleSave} 
                  type="primary"
                  style={styles.modalButton}
                />
              </View>
            </KeyboardAwareScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  summaryValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: colors.textPrimary,
    marginBottom: 8,
  },
  summarySubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  chartCard: {
    padding: 16,
    marginBottom: 24,
  },
  chartTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  investmentsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.primary,
    marginLeft: 4,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  investmentCard: {
    padding: 16,
    marginBottom: 12,
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  investmentName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  investmentDate: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: colors.textTertiary,
  },
  investmentAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingIcon: {
    marginRight: 4,
  },
  investmentAmount: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: colors.accent,
  },
  investmentNotes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  investmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 20,
  },
  input: {
    fontFamily: 'Inter-Regular',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  modalButton: {
    minWidth: 100,
    marginLeft: 12,
  },
});